import { readFileSync, writeFileSync } from "fs";
import { CountryCode, CountryData } from "./types.js";
import { SingleBar } from "cli-progress";
import {
  PROGRESS_BAR_FORMAT,
  languages,
  readTranslationsData,
  translateName,
  writeTranslationsToFiles,
} from "./util.js";

async function translateCityNames(
  fileToRead = "GPS-data.json",
  isPrint = false
) {
  const data: Record<CountryCode, CountryData> = JSON.parse(
    readFileSync(fileToRead, "utf8")
  );
  const pageSize = 5;
  let currIndex = 0;
  let totalDataCount = 0;
  for (const code in data) {
    for (const region in data[code][">"]) {
      totalDataCount += Object.keys(data[code][">"][region][">"]).length;
    }
  }
  let promises = [];
  const translations = readTranslationsData();

  const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);
  bar1.start(totalDataCount, 0);

  const missingResults = {};
  for (let countryCode in data) {
    const regionData = data[countryCode][">"];
    for (const regionEnglishName in regionData) {
      for (const cityEnglishName in regionData[regionEnglishName][">"]) {
        promises.push({
          promise: translateName(cityEnglishName, missingResults),
          countryCode,
          regionEnglishName,
          cityEnglishName,
        });
        currIndex++;
        bar1.increment(1);
        if (currIndex % pageSize == 0 || currIndex === totalDataCount) {
          const results = await Promise.all(promises.map((x) => x.promise));
          for (let i = 0; i < results.length; i++) {
            for (let lang in results[i]) {
              if (countryCode === "TR") continue;
              translations[lang][promises[i].countryCode][">"][
                promises[i].regionEnglishName
              ][">"][promises[i].cityEnglishName].t = results[i][lang];
            }
          }
          promises = [];
        }
        if (currIndex % 100 == 0) {
          writeTranslationsToFiles(translations);
        }
      }
    }
  }
  writeTranslationsToFiles(translations);
  bar1.stop();
  if (isPrint && Object.keys(missingResults).length > 0) {
    writeFileSync(
      "./missing-data/missing-city-names.json",
      JSON.stringify(Object.keys(missingResults))
    );
  }
}

translateCityNames("GPS-data.json", true);
