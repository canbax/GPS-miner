import { convertEnglishSubPlaceNameToTurkish } from "../src/turkish-character-converter";

describe("Unit tests", () => {
  it("Should convert English sub-city names to Turkish", async () => {
    const fn = convertEnglishSubPlaceNameToTurkish;
    expect(fn("Ankara", "Beypazari")).toEqual("Beypazarı");
    expect(fn("Ankara", "Ayas")).toEqual("Ayaş");
    expect(fn("Ankara", "Camlidere")).toEqual("Çamlıdere");
  });
});
