import { readFileSync } from "fs";
import { CountryCode, CountryData } from "./types.js";
import { readTranslationsData, writeTranslationsToFiles } from "./util.js";

/**
 * Somehow certain data's are generated unnecessarily using mine-GPS script. Translating data takes ~12 hours. So instead of re-running the long script, we can simply prune/delete unnecessary data
 * @param {string} [fileToRead="GPS-data.json"]
 * @returns {*}
 */
function pruneGeneratedDataUsingGPSData(
  fileToRead: string = "GPS-data.json"
): void {
  const data: Record<CountryCode, CountryData> = JSON.parse(
    readFileSync(fileToRead, "utf8")
  );
  const translations = readTranslationsData();

  for (const langCode in translations) {
    for (let countryCode in translations[langCode]) {
      if (!data[countryCode]) {
        delete translations[langCode][countryCode];
        continue;
      }
      for (let regionName in translations[langCode][countryCode][">"]) {
        if (!data[countryCode][">"][regionName]) {
          delete translations[langCode][countryCode][">"][regionName];
          continue;
        }
        for (let cityName in translations[langCode][countryCode][">"][
          regionName
        ][">"]) {
          if (!data[countryCode][">"][regionName][">"][cityName]) {
            delete translations[langCode][countryCode][">"][regionName][">"][
              cityName
            ];
            continue;
          }
        }
      }
    }
  }
  clearTurkishTranslationsOfTurkey(translations);
  addMissingCitiesToTranslations(data, translations);
  writeTranslationsToFiles(translations);
}

function clearTurkishTranslationsOfTurkey(
  translations: Record<string, Record<string, CountryData>>
) {
  const a = translations["tr"]["TR"];

  for (let regionName in translations["tr"]["TR"][">"]) {
    translations["tr"]["TR"][">"][regionName].t = "";
    for (let cityName in translations["tr"]["TR"][">"][regionName][">"]) {
      translations["tr"]["TR"][">"][regionName][">"][cityName].t = "";
    }
  }
}

/**
 * This function is just to add mistakenly deleted cities (sub-cities)
 * @param {Record<string, CountryData>} data
 * @param {Record<string, Record<string, CountryData>>} translations
 */
function addMissingCitiesToTranslations(
  data: Record<string, CountryData>,
  translations: Record<string, Record<string, CountryData>>
) {
  for (let langCode in translations) {
    for (let countryCode in data) {
      for (let region in data[countryCode][">"]) {
        for (let city in data[countryCode][">"][region][">"]) {
          const isCityExistInTranslation =
            translations[langCode][countryCode][">"][region][">"][city];
          if (!isCityExistInTranslation) {
            translations[langCode][countryCode][">"][region][">"][city] =
              data[countryCode][">"][region][">"][city];
          }
        }
      }
    }
  }
}

pruneGeneratedDataUsingGPSData("GPS-data.json");
