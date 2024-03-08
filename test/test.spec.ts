import { convertEnglishSubPlaceNameToTurkish } from "../src/turkish-character-converter";
import { readTranslationsData, translateName } from "../src/util";
import { expect, describe, test } from "vitest";

describe("convertEnglishSubPlaceNameToTurkish", () => {
  test("Should convert English sub-city names to Turkish", async () => {
    const fn = convertEnglishSubPlaceNameToTurkish;
    expect(fn("Ankara", "Beypazari")).toEqual("Beypazarı");
    expect(fn("Ankara", "Ayas")).toEqual("Ayaş");
    expect(fn("Ankara", "Camlidere")).toEqual("Çamlıdere");
  });
});

describe("translateName", () => {
  test("should return empty object for a random string", async () => {
    const result = await translateName("Ej2NqdPmR");
    expect(result).toEqual({});
  });

  test("should find translations for 'United states'", async () => {
    const result = await translateName("United states");
    expect(result).not.toEqual({});
    expect(Object.keys(result).length).toEqual(15);
    expect(result["tr"]).toEqual("Amerika Birleşik Devletleri");
  });
});

describe("generated data", () => {
  const translations = readTranslationsData();
  test("should get 242 countries in 15 languages", () => {
    expect(Object.keys(translations).length).toBe(15);
    for (const langCode in translations) {
      expect(Object.keys(translations[langCode]).length).toBe(242);
    }
  });

  test("should has Turkey in Turkish language with 81 regions (cities)", () => {
    expect(translations["tr"]["TR"].n).toEqual("Turkey");
    expect(translations["tr"]["TR"].t).toEqual("Türkiye");
    expect(Object.keys(translations["tr"]["TR"][">"]).length).toEqual(81);
  });

  test("should not translate regions and cities in Turkish for Turkey since it's redundant", () => {
    const regions = translations["tr"]["TR"][">"];
    for (let k in regions) {
      expect(regions[k].t).toEqual("");
      for (let city in regions[k][">"]) {
        expect(regions[k][">"][city].t).toEqual("");
      }
    }
  });

  test("There should not be a city named 'Merkez' in Turkey in Turkish", () => {
    const regions = translations["tr"]["TR"][">"];
    for (let region in regions) {
      for (let city in regions[region][">"]) {
        expect(regions[region][">"][city].t).not.toEqual("Merkez");
        expect(city).not.toEqual("Merkez");
      }
    }
  });

  test("Except for Hatay, Kocaeli, Sakarya, each region should have the same named city in Turkey in Turkish", () => {
    const regions = translations["tr"]["TR"][">"];
    const exceptions = ["Hatay", "Kocaeli", "Sakarya"];
    for (let region in regions) {
      const cities = Object.keys(regions[region][">"]);
      expect(
        exceptions.includes(region) || cities.includes(region)
      ).toBeTruthy();
    }
  });
});
