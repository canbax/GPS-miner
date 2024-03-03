# GPS-miner

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

`"n"` field in the data means `"name"`. `"t"` field in the data means `"translation"`. It generates data in 

## How it does?
- run `npm run mine-GPS` to generate GPS coordinates data with English place names
- run `npm run i18n-1` to translate Country names to 15 other languages (To run the command, open a folder named `generated-data` in the root directory )
- run `npm run i18n-2`  to translate Region names 

Outputs like below

------------------------------------------------------------------
gps-miner@0.0.1 i18n-1
tsc && node src/i18n-1.js && rm src/*.js

progress [========================================] 100% | 57s | 242/242
yusufcanbaz@Yusufs-MacBook-Pro GPS-miner % npm run i18n-2

gps-miner@0.0.1 i18n-2
tsc && node src/i18n-2.js && rm src/*.js

progress [========================================] 100% | 1239s | 5932/5932

------------------------------------------------------------------

### Details
There are two data sources it use

`nvm use 20.11.0` to use the right Node.js version



This site or product includes IP2Location LITE data available from <a href="https://lite.ip2location.com">https://lite.ip2location.com</a>.