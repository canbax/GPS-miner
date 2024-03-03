import { convertEnglishSubPlaceNameToTurkish } from "../src/turkish-character-converter";
import { translateName } from "../src/util";
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
