# Data Preparation

There are 2 raw data sources. https://github.com/dr5hn/countries-states-cities-database/blob/master/csv/cities.csv and https://github.com/OSMNames/OSMNames/ planet-latest_geonames.tsv file.

1. Filter OSM names planet data
First from OSMNames file, execute below awk command to filter out irrelevant places

```
# empty street ($11); class ($5) is multiple or place; type ($6) is state_district or city or town or village or municipality; lat, long, wikidata are not empty; and place_rank is smaller than 16
awk -F'\t' 'NR==1 || (($11 == "" || $11 == "-") && ($9 < 16) && ($3 == "relation" || $3 == "node") && ($7 != "" && $8 != "" && $22 != "") && ($5 == "multiple" || $5 == "place") && ($6 == "state_district" || $6 == "city" || $6 == "town" || $6 == "village" || $6 == "municipality") ) { print $0 }' OFS='\t' planet-latest_geonames.tsv > filtered_output4.tsv
```

2. use directly "dr5hn"

3. Merge all cities uniquely