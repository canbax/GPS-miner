import { readFileSync } from "fs";
import { Cities, WorldCities } from "./types.js";
import { processDr5hnForCities, processOSMForCities } from "./util.js";
import {
  countInData,
  countTurkeyMapPlaces,
  countWholeData,
} from "./turkish-character-converter.js";

// processDr5hnForCities({});

const data: WorldCities = JSON.parse(
  readFileSync("./data/all-cities.json", "utf8")
);
// processOSMForCities(data);

countTurkeyMapPlaces();
countWholeData(data);
countInData(data, "DE");
countInData(data, "CN");
countInData(data, "TR");
countInData(data, "US");
// console.log(data['CN']['Beijing'])
// processOSMForCities(data);
