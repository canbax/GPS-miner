import {
  readGPSData,
  readTranslationsData,
  writeDataFile,
  writeTranslationsToFiles,
} from "./util.js";

/**
 * sets GPS of country and region to the average of its children (ignore grandchildren)
 */
function setCountryRegionGPS(): void {
  const translations = readTranslationsData();

  for (const langCode in translations) {
    for (let countryCode in translations[langCode]) {
      let regionCount = 0;
      let totalRegionLat = 0;
      let totalRegionLng = 0;
      for (let regionName in translations[langCode][countryCode][">"]) {
        let cityCount = 0;
        let totalCityLat = 0;
        let totalCityLng = 0;
        for (let cityName in translations[langCode][countryCode][">"][
          regionName
        ][">"]) {
          const a =
            translations[langCode][countryCode][">"][regionName][">"][cityName];
          cityCount++;
          totalCityLat += a.g[0];
          totalCityLng += a.g[1];
        }
        if (!translations[langCode][countryCode][">"][regionName].g) {
          translations[langCode][countryCode][">"][regionName].g = [0, 0];
        }
        translations[langCode][countryCode][">"][regionName].g[0] =
          totalCityLat / cityCount;
        translations[langCode][countryCode][">"][regionName].g[1] =
          totalCityLng / cityCount;
        regionCount++;
        totalRegionLat +=
          translations[langCode][countryCode][">"][regionName].g[0];
        totalRegionLng +=
          translations[langCode][countryCode][">"][regionName].g[1];
      }
      if (!translations[langCode][countryCode].g) {
        translations[langCode][countryCode].g = [0, 0];
      }
      translations[langCode][countryCode].g[0] = totalRegionLat / regionCount;
      translations[langCode][countryCode].g[1] = totalRegionLng / regionCount;
    }
  }
  const data = readGPSData();
  const langCode = "tr";
  for (let countryCode in translations[langCode]) {
    data[countryCode].g = translations[langCode][countryCode].g;
    for (let regionName in translations[langCode][countryCode][">"]) {
      data[countryCode][">"][regionName].g =
        translations[langCode][countryCode][">"][regionName].g;
      for (let cityName in translations[langCode][countryCode][">"][regionName][
        ">"
      ]) {
        data[countryCode][">"][regionName][">"][cityName].g =
          translations[langCode][countryCode][">"][regionName][">"][cityName].g;
      }
    }
  }

  writeTranslationsToFiles(translations);
  writeDataFile(data);
}

setCountryRegionGPS();
