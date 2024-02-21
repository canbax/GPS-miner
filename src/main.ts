import { readFileSync } from "fs";
import { CountryCode, CountryData } from "./types";
import {
  printStatisticsInGeneratedFile,
  processDr5hnData,
  processIP2LocationData,
} from "./util";

let data: Record<CountryCode, CountryData> = {};

const GENERATED_FILE = "./countryData.json";
const IP2LOCATION_DATA_FILE = "./data/IP2LOCATION-LITE-DB5.CSV";
const DR5H_DATA_FILE = "./data/cities.csv";

async function main() {
  try {
    data = JSON.parse(readFileSync(GENERATED_FILE, "utf8"));
  } catch (err) {
    console.error("could not read file:", err);
  }

  await processDr5hnData(data, GENERATED_FILE, DR5H_DATA_FILE);
  await processIP2LocationData(data, GENERATED_FILE, IP2LOCATION_DATA_FILE);

  printStatisticsInGeneratedFile(GENERATED_FILE);
}
console.log('asd');
main();
console.log('asd2');