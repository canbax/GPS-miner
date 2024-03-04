import { readFileSync, writeFileSync } from "fs";
import { CountryCode, CountryData } from "./types.js";
import { SingleBar } from "cli-progress";
import { translateName, writeTranslationsToFiles } from "./util.js";

async function translateRegionNames(
  fileToRead = "GPS-data.json",
  isPrint = false
) {
  const t1 = new Date().getTime();

  const data: Record<CountryCode, CountryData> = JSON.parse(
    readFileSync(fileToRead, "utf8")
  );
  const pageSize = 5;
  let currIndex = 0;
  let totalDataCount = 0;
  for (const code in data) {
    totalDataCount += Object.keys(data[code][">"]).length;
  }
  let promises = [];
  const translations: Record<string, Record<CountryCode, CountryData>> = {};

  const opt = {
    format: "progress [{bar}] {percentage}% | {duration}s | {value}/{total}",
  };
  const bar1 = new SingleBar(opt);
  bar1.start(totalDataCount, 0);

  const missingResults = {};
  const nameMap: Record<string, string> = {};
  for (let countryCode in data) {
    for (const regionEnglishName in data[countryCode][">"]) {
      const nameToTranslate = nameMap[regionEnglishName] ?? regionEnglishName;
      promises.push({
        promise: translateName(nameToTranslate, missingResults),
        countryCode,
        regionEnglishName,
      });
      currIndex++;
      bar1.increment(1);
      if (currIndex % pageSize == 0 || currIndex === totalDataCount) {
        const results = await Promise.all(promises.map((x) => x.promise));
        for (let i = 0; i < results.length; i++) {
          for (let lang in results[i]) {
            if (!translations[lang]) {
              translations[lang] = JSON.parse(JSON.stringify(data));
            }
            translations[lang][promises[i].countryCode][">"][
              promises[i].regionEnglishName
            ].t = results[i][lang];
          }
        }
        promises = [];
      }
    }
  }
  writeTranslationsToFiles(translations);
  bar1.stop();
  if (isPrint && Object.keys(missingResults).length > 0) {
    writeFileSync(
      "./missing-data/missing-region-names.json",
      JSON.stringify(Object.keys(missingResults))
    );
  }
}

translateRegionNames("GPS-data.json", true);
// translateName("United States", {});
