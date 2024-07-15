# GPS Mining Process

## Generate Turkish cities from dr5hn/countries-states-cities-database

Run the script `process-dr5hn`. It will do the following steps.

- download cities.csv from [Github](https://github.com/dr5hn/countries-states-cities-database/blob/master/csv/cities.csv) the github repo (countries-states-cities-database) of [dr5hn](https://github.com/dr5hn)

  - get only TR cities
  - get only necessary columns
  - Replace `Hakkâri` with `Hakkari`
  - Replace name `Merkez` with the corresponding state name
  - Generate entries for the states that does not exist as a name such as İstanbul,Ankara from the average GPS of the it's children
  - lower case the country code to be consistent with geo names
  - name the result file as "turkish_cities.csv"

## Process planet-scale OSM names data

Run the script `process-planet-geonames`. It will do the following steps.

This is to enrich the Turkish cities with alternative names and add all other cities of the world.

- generate filtered_geonames.tsv from planet-scale OSM names data using bash script

  - get only cities or towns that could be a municipality
  - filter out unnecessary columns in the bash script
  - convert certain names to Turkish alphabet such as "Istanbul" -> "İstanbul"
  - filter-out all the tr country code names that are not in "turkish_cities.csv"

## Merge TSV and CSV files

Run the Python 3 script `merge-data.py`. It will do the following steps.

- merge 2 data files and create a singular TSV file which will be simply the database. (Let's name the file as "DB.tsv")

## Check and ensure data

- test the DB if it stores all things correctly

  - check all Turkish cities and states
  - check some random cities such as "Ulaanbaatar"
  - check number of states and cities in each country

- create an index file from the DB to find an entry in O(1) time

- create Trie by reading the DB and putting pointers to the DB entry using index file

  - for each weird character such as: "ç", "ö" ... add also it's English mapping in the Trie structure
  - gzip Trie data file if it's big

- read gzip file and then implement the search function
