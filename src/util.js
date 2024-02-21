"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printStatisticsInGeneratedFile = exports.processDr5hnData = exports.processIP2LocationData = void 0;
var child_process_1 = require("child_process");
var cli_progress_1 = require("cli-progress");
var fs_1 = require("fs");
var fast_csv_1 = require("fast-csv");
var turkish_character_converter_1 = require("./turkish-character-converter");
function getNumberOfLinesInFile(fileName) {
    return new Promise(function (resolve, reject) {
        // Command to execute
        var command = "wc -l " + fileName;
        // Execute the command
        (0, child_process_1.exec)(command, function (error, stdout, stderr) {
            if (error) {
                var errMsg = "Error executing the command: ".concat(error, " ").concat(stderr);
                console.error(errMsg);
                reject(errMsg);
                return;
            }
            var lineCount = Number(stdout.split(" ").filter(function (x) { return x; })[0]);
            resolve(lineCount);
            return;
        });
    });
}
function processIP2LocationData(data, generatedFile, sourcefilePath) {
    if (generatedFile === void 0) { generatedFile = "countryData.json"; }
    if (sourcefilePath === void 0) { sourcefilePath = "./data/IP2LOCATION-LITE-DB5.IPV6.CSV"; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var cntCoord, t1, bar1, lineCount;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                cntCoord = 0;
                                t1 = new Date().getTime();
                                bar1 = new cli_progress_1.SingleBar({}, cli_progress_1.Presets.shades_classic);
                                return [4 /*yield*/, getNumberOfLinesInFile(sourcefilePath)];
                            case 1:
                                lineCount = _a.sent();
                                bar1.start(lineCount, 0);
                                (0, fs_1.createReadStream)(sourcefilePath)
                                    .pipe((0, fast_csv_1.parse)({ headers: false }))
                                    .on("error", function (error) { return console.error(error); })
                                    .on("data", function (row) {
                                    bar1.increment(1);
                                    var countryCode = row[2];
                                    var countryName = row[3];
                                    var regionName = row[4];
                                    var cityName = row[5];
                                    var lat = row[6];
                                    var lng = row[7];
                                    if (countryCode === "-" || countryName === "-" || regionName === "-") {
                                        return;
                                    }
                                    if (turkish_character_converter_1.CITY_NAMES_EN_TO_TR[regionName]) {
                                        regionName = turkish_character_converter_1.CITY_NAMES_EN_TO_TR[regionName];
                                    }
                                    if (turkish_character_converter_1.CITY_NAMES_EN_TO_TR[cityName]) {
                                        cityName = turkish_character_converter_1.CITY_NAMES_EN_TO_TR[cityName];
                                    }
                                    if (!data[countryCode]) {
                                        data[countryCode] = { n: countryName, t: "", ">": {} };
                                    }
                                    if (!data[countryCode][">"][regionName]) {
                                        data[countryCode][">"][regionName] = { t: "", ">": {} };
                                    }
                                    if (!data[countryCode][">"][regionName][">"][cityName]) {
                                        var coords = [Number(lat), Number(lng)];
                                        if (hasTheSameCoordinate(data[countryCode][">"][regionName], coords))
                                            return;
                                        if (countryCode == "TR") {
                                            var s = (0, turkish_character_converter_1.convertEnglishSubPlaceNameToTurkish)(regionName, cityName);
                                            if (s) {
                                                data[countryCode][">"][regionName][">"][s] = { g: coords, t: "" };
                                                cntCoord++;
                                            }
                                        }
                                        else {
                                            data[countryCode][">"][regionName][">"][cityName] = {
                                                g: coords,
                                                t: "",
                                            };
                                            cntCoord++;
                                        }
                                    }
                                })
                                    .on("end", function () {
                                    bar1.stop();
                                    (0, fs_1.writeFile)(generatedFile, JSON.stringify(data), function (err) {
                                        if (err)
                                            console.log(err);
                                        var t2 = new Date().getTime();
                                        console.log("processed in", t2 - t1, "milliseconds", cntCoord, "coordinates");
                                        resolve(true);
                                    });
                                });
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.processIP2LocationData = processIP2LocationData;
function hasTheSameCoordinate(region, coords) {
    for (var city in region[">"]) {
        var currCoords = region[">"][city];
        if (currCoords.g[0] === coords[0] && currCoords.g[1] === coords[1])
            return true;
    }
    return false;
}
function processDr5hnData(data, generatedFile, sourcefilePath) {
    if (generatedFile === void 0) { generatedFile = "countryData.json"; }
    if (sourcefilePath === void 0) { sourcefilePath = "./data/cities.CSV"; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    var cntCoord, t1, bar1, lineCount, isHeaderLine;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                cntCoord = 0;
                                t1 = new Date().getTime();
                                bar1 = new cli_progress_1.SingleBar({}, cli_progress_1.Presets.shades_classic);
                                return [4 /*yield*/, getNumberOfLinesInFile(sourcefilePath)];
                            case 1:
                                lineCount = _a.sent();
                                bar1.start(lineCount, 0);
                                isHeaderLine = true;
                                (0, fs_1.createReadStream)(sourcefilePath)
                                    .pipe((0, fast_csv_1.parse)({ headers: false }))
                                    .on("error", function (error) { return console.error(error); })
                                    .on("data", function (row) {
                                    bar1.increment(1);
                                    if (isHeaderLine) {
                                        isHeaderLine = false;
                                        return;
                                    }
                                    var countryCode = row[6];
                                    var countryName = row[7];
                                    var regionName = row[4];
                                    var cityName = row[1];
                                    var lat = row[8];
                                    var lng = row[9];
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
                                        var coords = [Number(lat), Number(lng)];
                                        if (hasTheSameCoordinate(data[countryCode][">"][regionName], coords))
                                            return;
                                        data[countryCode][">"][regionName][">"][cityName] = {
                                            g: coords,
                                            t: "",
                                        };
                                        cntCoord++;
                                    }
                                })
                                    .on("end", function () {
                                    bar1.stop();
                                    (0, fs_1.writeFile)(generatedFile, JSON.stringify(data), function (err) {
                                        if (err)
                                            console.log(err);
                                        var t2 = new Date().getTime();
                                        console.log("milliseconds passed", t2 - t1, "added", cntCoord, "coordinates");
                                        resolve(true);
                                    });
                                });
                                return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.processDr5hnData = processDr5hnData;
function printStatisticsInGeneratedFile(fileName) {
    var data = JSON.parse((0, fs_1.readFileSync)(fileName, "utf8"));
    var regCount = 0;
    var cityCount = 0;
    for (var cou in data) {
        regCount += Object.keys(data[cou][">"]).length;
        for (var reg in data[cou][">"]) {
            cityCount += Object.keys(data[cou][">"][reg][">"]).length;
        }
    }
    console.log("country count ", Object.keys(data).length);
    console.log("region count: ", regCount);
    console.log("city count: ", cityCount);
}
exports.printStatisticsInGeneratedFile = printStatisticsInGeneratedFile;
