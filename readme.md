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
run `npm run x` command to generate "GPS-data.json" file.

### Details
There are two data sources it use

`nvm use 20.11.0` to use the right Node.js version
