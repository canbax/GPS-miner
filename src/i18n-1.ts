import { readFileSync, writeFileSync } from "fs";
import { CountryCode, CountryData } from "./types.js";
import { Presets, SingleBar } from "cli-progress";
import { translateName, writeTranslationsToFiles } from "./util.js";

export async function translateCountryNames(
  fileToRead = "GPS-data.json",
  isPrint = false
) {
  const t1 = new Date().getTime();

  const data: Record<CountryCode, CountryData> = JSON.parse(
    readFileSync(fileToRead, "utf8")
  );
  const pageSize = 5;
  let currIndex = 0;
  const totalDataCount = Object.keys(data).length;
  let promises = [];
  const translations: Record<string, Record<CountryCode, CountryData>> = {};

  const bar1 = new SingleBar({}, Presets.shades_classic);
  bar1.start(totalDataCount, 0);

  const missingResults = {};
  const nameMap: Record<string, string> = {
    "Antigua And Barbuda": "Antigua and Barbuda",
    "Bonaire, Sint Eustatius and Saba": "Caribbean Netherlands",
    China: "People's Republic of China",
    "Cote D'Ivoire (Ivory Coast)": "Ivory Coast",
    "Fiji Islands": "Fiji",
    "Gambia The": "The Gambia",
    "Hong Kong S.A.R.": "Hong Kong",
    Ireland: "Republic of Ireland",
    Micronesia: "Federated States of Micronesia",
    "Papua new Guinea": "Papua New Guinea",
    "Saint Kitts And Nevis": "Saint Kitts and Nevis",
    "Saint Vincent And The Grenadines": "Saint Vincent and the Grenadines",
    "Sao Tome and Principe": "São Tomé and Príncipe",
    Swaziland: "Eswatini",
    "Trinidad And Tobago": "Trinidad and Tobago",
    "United States": "United States of America",
    "Virgin Islands (US)": "Virgin Islands",
    "Palestine, State of": "State of Palestine",
    "Aland Islands": "Åland Islands",
    "Saint Martin (French part)": "Saint-Martin",
    "Virgin Islands (British)": "British Virgin Islands",
    "Cocos (Keeling) Islands": "Cocos Islands",
    "Saint Barthelemy": "Saint Barthélemy",
    "Falkland Islands [Malvinas]": "Falkland Islands",
    "Sint Maarten (Dutch part)": "Sint Maarten",
  };
  for (let countryCode in data) {
    const englishName = data[countryCode].n;
    const nameToTranslate = nameMap[englishName] ?? englishName;
    promises.push({
      promise: translateName(nameToTranslate, missingResults),
      countryCode,
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
          translations[lang][promises[i].countryCode].t = results[i][lang];
        }
      }
      promises = [];
    }
  }
  writeTranslationsToFiles(translations);
  bar1.stop();
  if (isPrint && Object.keys(missingResults).length > 0)
    console.log("missingResults: ", missingResults);
  console.log(new Date().getTime() - t1, "MS elapsed");
}

translateCountryNames("GPS-data.json", true);
