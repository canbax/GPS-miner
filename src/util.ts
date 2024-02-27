import { exec } from "child_process";
import {
  CountryCode,
  CountryData,
  RegionData,
  SupportedLanguage,
} from "./types.js";
import { SingleBar, Presets } from "cli-progress";
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

export async function processIP2LocationData(
  data: Record<CountryCode, CountryData>,
  generatedFile: string = "GPS-data.json",
  sourcefilePath: string = "./data/IP2LOCATION-LITE-DB5.IPV6.CSV"
) {
  return new Promise(async (resolve) => {
    let cntCoord = 0;
    const t1 = new Date().getTime();

    const bar1 = new SingleBar({}, Presets.shades_classic);

    const lineCount = await getNumberOfLinesInFile(sourcefilePath);
    bar1.start(lineCount, 0);

    createReadStream(sourcefilePath)
      .pipe(parse({ headers: false }))
      .on("error", (error: any) => console.error(error))
      .on("data", (row: any) => {
        bar1.increment(1);
        const countryCode = row[2];
        const countryName = row[3];
        let regionName = row[4];
        let cityName = row[5];
        const lat = row[6];
        const lng = row[7];
        if (countryCode === "-" || countryName === "-" || regionName === "-") {
          return;
        }
        if (CITY_NAMES_EN_TO_TR[regionName]) {
          regionName = CITY_NAMES_EN_TO_TR[regionName];
        }
        if (CITY_NAMES_EN_TO_TR[cityName]) {
          cityName = CITY_NAMES_EN_TO_TR[cityName];
        }
        if (!data[countryCode]) {
          data[countryCode] = { n: countryName, t: "", ">": {} };
        }
        if (!data[countryCode][">"][regionName]) {
          data[countryCode][">"][regionName] = { t: "", ">": {} };
        }
        if (!data[countryCode][">"][regionName][">"][cityName]) {
          const coords: [number, number] = [Number(lat), Number(lng)];
          if (hasTheSameCoordinate(data[countryCode][">"][regionName], coords))
            return;
          if (countryCode == "TR") {
            const s = convertEnglishSubPlaceNameToTurkish(regionName, cityName);
            if (s) {
              data[countryCode][">"][regionName][">"][s] = { g: coords, t: "" };
              cntCoord++;
            }
          } else {
            data[countryCode][">"][regionName][">"][cityName] = {
              g: coords,
              t: "",
            };
            cntCoord++;
          }
        }
      })
      .on("end", () => {
        bar1.stop();
        writeFile(generatedFile, JSON.stringify(data), function (err) {
          if (err) console.log(err);
          const t2 = new Date().getTime();
          console.log(
            "processed in",
            t2 - t1,
            "milliseconds",
            cntCoord,
            "coordinates"
          );
          resolve(true);
        });
      });
  });
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
    const t1 = new Date().getTime();

    const bar1 = new SingleBar({}, Presets.shades_classic);

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
        if (countryCode === "-" || countryName === "-" || regionName === "-") {
          return;
        }
        if (!data[countryCode]) {
          data[countryCode] = { n: countryName, t: "", ">": {} };
        }
        if (!data[countryCode][">"][regionName]) {
          data[countryCode][">"][regionName] = { t: "", ">": {} };
        }
        if (!data[countryCode][">"][regionName][">"][cityName]) {
          const coords: [number, number] = [Number(lat), Number(lng)];
          if (hasTheSameCoordinate(data[countryCode][">"][regionName], coords))
            return;
          data[countryCode][">"][regionName][">"][cityName] = {
            g: coords,
            t: "",
          };
          cntCoord++;
        }
      })
      .on("end", () => {
        bar1.stop();
        writeFile(generatedFile, JSON.stringify(data), function (err) {
          if (err) console.log(err);
          const t2 = new Date().getTime();
          console.log(
            "milliseconds passed",
            t2 - t1,
            "added",
            cntCoord,
            "coordinates"
          );
          resolve(true);
        });
      });
  });
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
    const result = await fetch(url);
    return await result.json();
  } catch (error) {
    return "error: " + error;
  }
}

const wdk = WBK({
  instance: "https://www.wikidata.org",
  sparqlEndpoint: "https://query.wikidata.org/sparql",
});

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
  missingResults: any,
  isPrint = false
) {
  const selectExpression = languages.map((x) => "?" + x).join(" ");
  const languageFilter = languages
    .map(
      (x) => `OPTIONAL { ?item rdfs:label ?${x}. FILTER(LANG(?${x}) = "${x}") }`
    )
    .join("\n");

  const query = `
  SELECT DISTINCT ?item ?itemLabel ${selectExpression}
  WHERE {
    ?item rdfs:label "${name}"@en.
    ${languageFilter}
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  `;
  const url = wdk.sparqlQuery(query);
  const data = await httpGet(url);
  const result: any = {};
  for (const lang of languages) {
    let maximumResult: any = {};
    for (let i of data.results.bindings) {
      if (Object.keys(i).length > Object.keys(maximumResult).length) {
        maximumResult = i;
      }
    }
    if (maximumResult && maximumResult[lang]) {
      result[lang] = maximumResult[lang].value;
    }
  }
  if (Object.keys(result).length === 0) {
    missingResults[name] = true;
  }
  if (isPrint) {
    console.log("result: ", result, "missing: ", missingResults);
  }
  return result;
}

export function writeTranslationsToFiles(
  translations: Record<string, Record<CountryCode, CountryData>>
) {
  for (let langCode in translations) {
    const fileName = "./generated-data/GPS-data-" + langCode + ".json";
    writeFileSync(fileName, JSON.stringify(translations[langCode]));
  }
}