# generate GPS data from IP2Location

- download IP2LOCATION-LITE-DB5.CSV file from https://lite.ip2location.com/database/db5-ip-country-region-city-latitude-longitude and then place into `data` folder
- run `npm run mine-GPS` to generate data as a JSON
  - it will run `mine-GPS.ts` script to add more cities to the existing JSON. Note that it doesn't create result from empty object to not lose the previous data. IP2location data changes month by month
- then run `python3 convert_json_to_tsv.py` to generate `gps-data-tsv.tsv`. This file will be used to in the main branch to merge with list of cities and check if all cities exist
- run `npm run mine-countries` to generate country names in multiple languages.

whole script is `npm run mine-GPS && python3 convert_json_to_tsv.py && npm run mine-countries`
