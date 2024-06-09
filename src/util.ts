import { exec } from "child_process";
import {
  Cities,
  CountryCode,
  CountryData,
  CountryTranslations,
  RegionData,
  SupportedLanguage,
  WorldCities,
} from "./types.js";
import { SingleBar } from "cli-progress";
import { createReadStream, writeFile, writeFileSync, readFileSync } from "fs";
import { parse } from "fast-csv";
import { WBK } from "wikibase-sdk";
import {
  CITY_NAMES_EN_TO_TR,
  convertEnglishSubPlaceNameToTurkish,
} from "./turkish-character-converter.js";

function getNumberOfLinesInFile(fileName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // Command to execute
    const command = "wc -l " + fileName;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const errMsg = `Error executing the command: ${error} ${stderr}`;
        console.error(errMsg);
        reject(errMsg);
        return;
      }

      const lineCount = Number(stdout.split(" ").filter((x) => x)[0]);
      resolve(lineCount);
      return;
    });
  });
}

export const PROGRESS_BAR_FORMAT = {
  format: "progress [{bar}] {percentage}% | {duration}s | {value}/{total}",
} as const;

export async function processIP2LocationData(
  data: Record<CountryCode, CountryData>,
  generatedFile: string = "GPS-data.json",
  sourcefilePath: string = "./data/IP2LOCATION-LITE-DB5.IPV6.CSV"
) {
  return new Promise(async (resolve) => {
    let cntCoord = 0;

    const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);

    const lineCount = await getNumberOfLinesInFile(sourcefilePath);
    bar1.start(lineCount, 0);

    createReadStream(sourcefilePath)
      .pipe(parse({ headers: false }))
      .on("error", (error: any) => console.error(error))
      .on("data", (row: any) => {
        bar1.increment(1);
        const isAdded = addToData(
          data,
          row[2],
          row[3],
          row[4],
          row[5],
          row[6],
          row[7]
        );
        if (isAdded) cntCoord++;
      })
      .on("end", () => {
        bar1.stop();
        writeDataToFile(data, generatedFile, resolve);
      });
  });
}

export async function extractCountriesFromIP2LocationData(
  data: CountryTranslations,
  generatedFile: string = "GPS-data.json",
  sourcefilePath: string = "./data/IP2LOCATION-LITE-DB5.IPV6.CSV"
) {
  return new Promise(async (resolve) => {
    const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);
    const lineCount = await getNumberOfLinesInFile(sourcefilePath);
    bar1.start(lineCount, 0);

    createReadStream(sourcefilePath)
      .pipe(parse({ headers: false }))
      .on("error", (error: any) => console.error(error))
      .on("data", (row: any) => {
        bar1.increment(1);
        const countryCode = row[2];
        const countryName = row[3];
        if (countryCode.length < 2) return;
        if (data[countryCode]) {
          data[countryCode]["en"] = countryName;
        } else {
          data[countryCode] = { en: countryName };
        }
      })
      .on("end", () => {
        bar1.stop();
        writeCountryTranslationsFile(data, generatedFile, resolve);
      });
  });
}

function addToData(
  data: Record<CountryCode, CountryData>,
  countryCode: string,
  countryName: string,
  regionName: string,
  cityName: string,
  lat: string,
  lng: string
): boolean {
  if (countryCode === "-" || countryName === "-" || regionName === "-") {
    return false;
  }
  if (CITY_NAMES_EN_TO_TR[regionName]) {
    regionName = CITY_NAMES_EN_TO_TR[regionName];
  }
  if (CITY_NAMES_EN_TO_TR[cityName]) {
    cityName = CITY_NAMES_EN_TO_TR[cityName];
  }
  if (!data[countryCode]) {
    data[countryCode] = { n: countryName, t: "", g: [0, 0], ">": {} };
  }
  if (!data[countryCode][">"][regionName]) {
    data[countryCode][">"][regionName] = { t: "", g: [0, 0], ">": {} };
  }
  if (!data[countryCode][">"][regionName][">"][cityName]) {
    const coords: [number, number] = [Number(lat), Number(lng)];
    if (hasTheSameCoordinate(data[countryCode][">"][regionName], coords))
      return false;
    if (countryCode === "TR") {
      const s = convertEnglishSubPlaceNameToTurkish(regionName, cityName);
      if (s) {
        data[countryCode][">"][regionName][">"][s] = { g: coords, t: "" };
        return true;
      }
    } else {
      data[countryCode][">"][regionName][">"][cityName] = {
        g: coords,
        t: "",
      };
      return true;
    }
  }
  return false;
}

function hasTheSameCoordinate(region: RegionData, coords: [number, number]) {
  for (let city in region[">"]) {
    const currCoords = region[">"][city];
    if (currCoords.g[0] === coords[0] && currCoords.g[1] === coords[1])
      return true;
  }
  return false;
}

export async function processDr5hnData(
  data: Record<CountryCode, CountryData>,
  generatedFile: string = "GPS-data.json",
  sourcefilePath: string = "./data/cities.CSV"
) {
  return new Promise(async (resolve) => {
    let cntCoord = 0;
    const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);

    const lineCount = await getNumberOfLinesInFile(sourcefilePath);
    bar1.start(lineCount, 0);

    let isHeaderLine = true;
    createReadStream(sourcefilePath)
      .pipe(parse({ headers: false }))
      .on("error", (error: any) => console.error(error))
      .on("data", (row: any) => {
        bar1.increment(1);

        if (isHeaderLine) {
          isHeaderLine = false;
          return;
        }
        const countryCode = row[6];
        const countryName = row[7];
        let regionName = row[4];
        let cityName = row[1];
        const lat = row[8];
        const lng = row[9];
        const isAdded = addToData(
          data,
          countryCode,
          countryName,
          regionName,
          cityName,
          lat,
          lng
        );
        if (isAdded) cntCoord++;
      })
      .on("end", () => {
        bar1.stop();
        writeDataToFile(data, generatedFile, resolve);
      });
  });
}

function writeCountryTranslationsFile(
  data: CountryTranslations,
  generatedFile: string,
  resolve: (value: unknown) => void
) {
  writeFile(generatedFile, JSON.stringify(data), function (err) {
    if (err) console.log(err);
    resolve(true);
  });
}

function writeDataToFile(
  data: Record<CountryCode, CountryData>,
  generatedFile: string,
  resolve: (value: unknown) => void
) {
  pruneRegionsWithNoCity(data);
  writeFile(generatedFile, JSON.stringify(data), function (err) {
    if (err) console.log(err);
    resolve(true);
  });
}

function pruneRegionsWithNoCity(data: Record<CountryCode, CountryData>) {
  for (const countryCode in data) {
    for (const reg in data[countryCode][">"]) {
      const cityCount = Object.keys(data[countryCode][">"][reg][">"]).length;
      if (cityCount < 1) {
        delete data[countryCode][">"][reg];
      }
    }
  }
}

export function printStatisticsInGeneratedFile(fileName: string) {
  const data: Record<CountryCode, CountryData> = JSON.parse(
    readFileSync(fileName, "utf8")
  );
  let regCount = 0;
  let cityCount = 0;
  for (const cou in data) {
    regCount += Object.keys(data[cou][">"]).length;
    for (const reg in data[cou][">"]) {
      cityCount += Object.keys(data[cou][">"][reg][">"]).length;
    }
  }
  console.log("country count ", Object.keys(data).length);
  console.log("region count: ", regCount);
  console.log("city count: ", cityCount);
}

export async function httpGet(url: string) {
  try {
    const headers = new Headers();
    headers.append("pragma", "no-cache");
    headers.append(
      "User-Agent",
      "GPS-minerBot/0.0.1 (https://github.com/canbax/GPS-miner; yusufsaidcanbaz@gmail.com)"
    );
    headers.append("cache-control", "no-cache");
    const result = await fetch(url, { cache: "no-store", headers });
    return await result.json();
  } catch (error) {
    return "error: " + error;
  }
}

export const languages: SupportedLanguage[] = [
  "ar",
  "az",
  "de",
  "es",
  "fa",
  "fr",
  "id",
  "it",
  "kk",
  "ko",
  "ky",
  "ms",
  "ru",
  "tr",
  "zh",
];

export async function translateName(
  name: string,
  missingResults?: Record<string, boolean>
): Promise<Record<SupportedLanguage, string>> {
  if (!missingResults) {
    missingResults = {};
  }
  let translations = await translateByLabel(name);
  if (Object.keys(translations).length < 1) {
    const labelInWiki = await getWikiDataLabelBySearchingEntity(name);
    if (labelInWiki) {
      translations = await translateByLabel(labelInWiki);
    }
  }
  if (Object.keys(translations).length < 1) {
    missingResults[name] = true;
  }
  return translations;
}

export async function getWikiDataLabelBySearchingEntity(
  name: string
): Promise<string | undefined> {
  const wbk = WBK({
    instance: "https://www.wikidata.org",
    sparqlEndpoint: "https://query.wikidata.org/sparql",
  });
  const searchResults = await httpGet(
    wbk.searchEntities({ search: name, limit: 1 })
  );
  return searchResults?.search?.[0]?.label;
}

export function writeTranslationsToFiles(
  translations: Record<string, Record<CountryCode, CountryData>>
) {
  for (let langCode in translations) {
    const fileName = "./generated-data/GPS-data-" + langCode + ".json";
    writeFileSync(fileName, JSON.stringify(translations[langCode]));
  }
}

export function writeDataFile(data: Record<CountryCode, CountryData>) {
  writeFileSync("GPS-data.json", JSON.stringify(data));
}

export async function translateByLabel(
  label: string
): Promise<Record<SupportedLanguage, string>> {
  const wbk = WBK({
    instance: "https://www.wikidata.org",
    sparqlEndpoint: "https://query.wikidata.org/sparql",
  });
  const selectExpression = languages.map((x) => "?" + x).join(" ");
  const languageFilter = languages
    .map(
      (x) => `OPTIONAL { ?item rdfs:label ?${x}. FILTER(LANG(?${x}) = "${x}") }`
    )
    .join("\n");

  const query = `
  SELECT DISTINCT ?item ?itemLabel ${selectExpression}
  WHERE {
    ?item rdfs:label "${label}"@en.
    ${languageFilter}
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  `;
  const data = await httpGet(wbk.sparqlQuery(query));
  if (!data?.results?.bindings || !Array.isArray(data.results.bindings)) {
    return {};
  }
  const result: Record<SupportedLanguage, string> = {};
  let maximumResult: any = {};
  for (let i of data.results.bindings) {
    if (Object.keys(i).length > Object.keys(maximumResult).length) {
      maximumResult = i;
    }
  }
  for (const lang of languages) {
    if (maximumResult && maximumResult[lang]) {
      result[lang] = maximumResult[lang].value;
    }
  }
  return result;
}

export function readTranslationsData() {
  const translations: Record<string, Record<CountryCode, CountryData>> = {};
  for (let langCode of languages) {
    const fileName = "./generated-data/GPS-data-" + langCode + ".json";
    translations[langCode] = JSON.parse(readFileSync(fileName, "utf8"));
  }
  return translations;
}

export function readGPSData() {
  const data: Record<CountryCode, CountryData> = JSON.parse(
    readFileSync("GPS-data.json", "utf8")
  );
  return data;
}

function convertNamesToTurkishIfNeeded(
  countryCode: CountryCode,
  cityName: string,
  stateName: string
) {
  if (countryCode !== "TR") {
    return { cityName, stateName };
  }
}

export async function processDr5hnForCities(
  data: WorldCities,
  generatedFile: string = "./data/all-cities.json",
  sourcefilePath: string = "./data/cities.csv"
) {
  return new Promise(async () => {
    const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);

    const lineCount = await getNumberOfLinesInFile(sourcefilePath);
    bar1.start(lineCount, 0);

    let isHeaderLine = true;
    createReadStream(sourcefilePath)
      .pipe(parse({ headers: false }))
      .on("error", (error: any) => console.error(error))
      .on("data", (row: any) => {
        bar1.increment(1);

        if (isHeaderLine) {
          isHeaderLine = false;
          return;
        }
        let cityName = row[1];
        let stateName = row[4];
        const countryCode = row[6] as CountryCode;
        const lat = row[8];
        const lng = row[9];
        if (!data[countryCode]) {
          data[countryCode] = {};
        }
        if (countryCode === "TR") {
          if (CITY_NAMES_EN_TO_TR[stateName]) {
            stateName = CITY_NAMES_EN_TO_TR[stateName];
          }
          const s = convertEnglishSubPlaceNameToTurkish(stateName, cityName);
          if (s) {
            cityName = s;
          } else {
            return; // turkish city not defined!
          }
        }
        if (!data[countryCode][stateName]) {
          data[countryCode][stateName] = {};
        }
        data[countryCode][stateName][cityName] = ["", lat, lng];
      })
      .on("end", () => {
        bar1.stop();
        writeFileSync(generatedFile, JSON.stringify(data));
      });
  });
}

export async function processOSMForCities(
  data: WorldCities,
  generatedFile: string = "./data/all-cities.json",
  sourcefilePath: string = "./data/filtered_output5.tsv"
) {
  return new Promise(async () => {
    const bar1 = new SingleBar(PROGRESS_BAR_FORMAT);

    const lineCount = await getNumberOfLinesInFile(sourcefilePath);
    bar1.start(lineCount, 0);

    let isHeaderLine = true;
    createReadStream(sourcefilePath)
      .pipe(
        parse({
          headers: false,
          trim: true,
          ignoreEmpty: true,
          delimiter: "\t",
        })
      )
      .on("error", (error: any) => console.error(error))
      .on("data", (row: any) => {
        bar1.increment(1);

        if (isHeaderLine) {
          isHeaderLine = false;
          return;
        }
        let cityName = row[0];
        let otherNames = row[1];
        let stateName = row[4];
        const countryCode = row[5].toUpperCase() as CountryCode;
        const lat = row[3];
        const lng = row[2];
        if (!data[countryCode]) {
          data[countryCode] = {};
        }
        if (countryCode === "TR") {
          if (CITY_NAMES_EN_TO_TR[stateName]) {
            stateName = CITY_NAMES_EN_TO_TR[stateName];
          }
          const s = convertEnglishSubPlaceNameToTurkish(stateName, cityName);
          if (s) {
            cityName = s;
          } else {
            return; // turkish city not defined!
          }
        }
        if (!data[countryCode][stateName]) {
          data[countryCode][stateName] = {};
        }
        if (data[countryCode][stateName][cityName]) {
          console.log("set othernames: ", otherNames);
          data[countryCode][stateName][cityName][0] = otherNames;
        } else {
          data[countryCode][stateName][cityName] = [otherNames, lat, lng];
        }
      })
      .on("end", () => {
        bar1.stop();
        writeFileSync(generatedFile, JSON.stringify(data, null, 2));
      });
  });
}
