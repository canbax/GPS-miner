import { readFileSync, writeFileSync } from "fs";
import { CountryTranslations } from "./types.js";
import {
  PROGRESS_BAR_FORMAT,
  extractCountriesFromIP2LocationData,
  translateName,
} from "./util.js";
import { mappingForMissingCountryNames } from "./hard-coded-data.js";
import { SingleBar } from "cli-progress";

let data: CountryTranslations = {};

const GENERATED_FILE = "./country-translations.json";
const IP2LOCATION_DATA_FILE = "./data/IP2LOCATION-LITE-DB5.CSV";

async function generateEnglishCountryData() {
  try {
    data = JSON.parse(readFileSync(GENERATED_FILE, "utf8"));
  } catch (err) {
    console.error("could not read file:", err);
  }

  await extractCountriesFromIP2LocationData(
    data,
    GENERATED_FILE,
    IP2LOCATION_DATA_FILE
  );
}

async function translateCountryNames(isPrint = false) {
  try {
    data = JSON.parse(readFileSync(GENERATED_FILE, "utf8"));
  } catch (err) {
    console.error("could not read file:", err);
  }

  const pageSize = 5;
  let currIndex = 0;
  const totalDataCount = Object.keys(data).length;
  let promises = [];

  const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);
  bar1.start(totalDataCount, 0);

  const missingResults = {};
  for (let countryCode in data) {
    const englishName = data[countryCode]["en"];
    const nameToTranslate =
      mappingForMissingCountryNames[englishName] ?? englishName;
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
          data[promises[i].countryCode][lang] = results[i][lang];
        }
      }
      promises = [];
    }
  }
  writeFileSync(GENERATED_FILE, JSON.stringify(data));
  bar1.stop();
  if (isPrint && Object.keys(missingResults).length > 0) {
    writeFileSync(
      "./missing-data/missing-country-names.json",
      JSON.stringify(Object.keys(missingResults))
    );
  }
}
// generateEnglishCountryData();
translateCountryNames();
