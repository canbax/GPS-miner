# GPS-miner

A script to generate multilingual GPS data of all places in the world in a hierarchical structure.

## What it does?

Generates JSON data with Typescript type `Record<CountryCode, CountryData>` such as

```
{
    "US": {
        "n": "United States",
        "t": "",
        ">": {
            "Alabama": {
                "t": "",
                ">": {
                    "Abbeville": {
                        "g": [
                            31.57184,
                            -85.25049
                        ],
                        "t": ""
                    },
                    "Adamsville": {
                        "g": [
                            33.60094,
                            -86.95611
                        ],
                        "t": ""
                    },
                    ...
                }
            }
    },
    ...
}
```

`"n"` field in the data means "name". `"t"` field in the data means "translation". `"g"` field in the data means "GPS coordinates". See "generated-data" folder too see the whole data. Each file in the folder is in a specific language. For example, "GPS-data-tr.json" file is in Turkish.

Currently there are 242 countries, 5932 regions and 197778 GPS coordinates.

## How it does?

- run `npm run mine-GPS` to generate GPS coordinates data with English place names (takes ~ 60 seconds)
  - processes "IP2LOCATION" and "Dr5hn" data files and creates "GPS-data.json" file.
- run `npm run i18n-1` to translate country names to 15 other languages (takes ~ 60 seconds)
- run `npm run i18n-2` to translate region/state/city names (takes ~ 5 minutes)
- run `npm run i18n-3` to translate city/district/county names (takes ~ 12 hours)
- run `npm run prune-generated-data` to prune data from unnecessary data
- run `npm run enrich-gps` sets GPS of country and region to the average of its children (ignore grandchildren)

### Details

- `nvm use 20.11.0` to use the right Node.js version

- Special thanks to GPS data providers

  - This site or product includes IP2Location LITE data available from <a href="https://lite.ip2location.com">https://lite.ip2location.com</a>.

  - https://github.com/dr5hn/countries-states-cities-database

- Place names are translated to 15 other languages (Arabic, Azeri, German, Spanish, Farsi, French, Indonesian, Italian, Kazakh, Korean, Kyrgyz, Malay, Russian, and, Turkish) using [Wikidata](https://www.wikidata.org/) and [wikibase-sdk](https://www.npmjs.com/package/wikibase-sdk).
