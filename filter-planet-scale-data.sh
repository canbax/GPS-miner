awk -F'\t' 'NR==1 || ($5 == "place" && ($6 == "city" || $6 == "town" || $6 == "village" || $6 == "hamlet")) { print $1, $2, $7, $8, $16, $14, $13, $12 }' OFS='\t' planet-latest_geonames.tsv  > filtered_output.tsv

# ($11 == "" || $11 == "-") ensures the street field is empty or undefined
awk -F'\t' 'NR==1 || ($5 == "place" && ($6 == "city" || $6 == "town" || $6 == "village" || $6 == "hamlet") && ($11 == "" || $11 == "-")) { print $1, $2, $7, $8, $16, $14, $13, $12 }' OFS='\t' planet-latest_geonames.tsv > filtered_output.tsv

# empty street ($11), osm_type ($3) is relation, class ($5) is multiple, type ($6) is state_district, lat & long are not empty 
awk -F'\t' 'NR==1 || (($11 == "" || $11 == "-") && ($3 == "relation") && ($7 != "" && $8 != "") && ($5 == "multiple") && ($6 == "state_district" || $6 == "city") ) { print $1, $2, $7, $8, $16, $14, $13, $12 }' OFS='\t' planet-latest_geonames.tsv > filtered_output2.tsv

# empty street ($11), class ($5) is multiple, type ($6) is state_district, lat & long are not empty 
awk -F'\t' 'NR==1 || (($11 == "" || $11 == "-") && ($3 == "relation") && ($7 != "" && $8 != "") && ($5 == "multiple") && ($6 == "state_district" || $6 == "city") ) { print $1, $2, $7, $8, $16, $14, $13, $12 }' OFS='\t' planet-latest_geonames.tsv > filtered_output2.tsv

# empty street ($11); class ($5) is multiple or place; type ($6) is state_district or city or town or village or municipality; lat, long, wikidata are not empty 
awk -F'\t' 'NR==1 || (($11 == "" || $11 == "-") && ($3 == "relation" || $3 == "node") && ($7 != "" && $8 != "" && $22 != "") && ($5 == "multiple" || $5 == "place") && ($6 == "state_district" || $6 == "city" || $6 == "town" || $6 == "village" || $6 == "municipality") ) { print $1, $2, $3, $5, $6, $7, $8, $9, $12, $13, $14, $15, $16 }' OFS='\t' planet-latest_geonames.tsv > filtered_output3.tsv

# empty street ($11); class ($5) is multiple or place; type ($6) is state_district or city or town or village or municipality; lat, long, wikidata are not empty; and place_rank is smaller than 16 
awk -F'\t' 'NR==1 || (($11 == "" || $11 == "-") && ($9 < 16) && ($3 == "relation" || $3 == "node") && ($7 != "" && $8 != "" && $22 != "") && ($5 == "multiple" || $5 == "place") && ($6 == "state_district" || $6 == "city" || $6 == "town" || $6 == "village" || $6 == "municipality") ) { print $0 }' OFS='\t' planet-latest_geonames.tsv > filtered_output3.tsv

# search for a name
awk -F'\t' '$1 == "Keçiören" { print $1,$3,$5,$6 }' planet-latest_geonames.tsv
awk -F'\t' '$1 == "Kabul" { print $0 }' planet-latest_geonames.tsv
awk -F'\t' '$6 == "municipality" { print $0 }' planet-latest_geonames.tsv
awk -F'\t' '($1 == "Kabul"||$1 == "Keçiören"||$1 == "Irvine"||$1 == "Ankara") && ($3 == "relation" || $3 == "node") && ($5 == "multiple" || $5 == "place") { print $0 }' planet-latest_geonames.tsv > sample_cities.tsv

## results
## Ankara node place 32.85405 39.92079
## Kabul node place 69.17768 34.52601
## Ankara relation place 32.49629 39.71659
## Irvine node place -4.66556 55.61431
## Kabul node place 35.21006 32.86770
## Kabul relation place 35.20445 32.87673
## Irvine relation place -117.77013 33.68650
## Irvine node place -117.82598 33.68570
## Irvine relation place -83.97069 37.69968
## Irvine node place -83.97381 37.70064
## Keçiören relation multiple 32.83411 40.08650
## Ankara node place 1.88333 12.93333
## Kabul way place 35.20945 32.86877
## Irvine node place -79.26838 41.83923
## Irvine node place -105.30554 42.66497
## Irvine node place -91.41988 44.92552
## Kabul node place 38.03110 7.87471
## Kabul node place 75.59409 25.51961
## Ankara node place -69.56436 -17.23447
## Irvine node place -82.25121 29.40553
## Irvine node place -4.67484 55.61123
## Irvine node place -110.27326 49.95844
## Kabul way highway -58.23370 -34.80436
## Kabul way highway -78.63084 -1.67639
## Kabul way highway -78.42364 -0.05437
## Kabul way highway -58.24205 -34.81262
## Kabul way highway 121.13380 14.55016
## Ankara way highway 20.64954 42.05961
## Irvine way highway 121.06883 14.26879
## Ankara way highway -79.15270 -0.24232
## Ankara way highway -58.49777 -34.65002
## Ankara way highway -78.42348 -0.05634
## Kabul way highway -64.50934 -31.32352
## Kabul way highway 34.02090 41.33593
## Ankara relation highway -76.54300 3.36344
## Ankara node place 29.87808 40.52786
## Ankara node place 32.84346 39.93541
## Ankara way highway 69.16622 34.53713
## Ankara way highway 33.63773 34.91095
## Ankara way highway 69.16828 34.53593
## Ankara way highway -70.73830 -33.42237
## Ankara way highway -71.23771 -32.88225
## Irvine node place -117.73358 33.65678
## Kabul way highway -71.23753 -32.88058
## Ankara way multiple 20.74176 42.21625
## Irvine way highway -123.34072 48.49510

# list all possible types
awk -F'\t' 'NR > 1 { types[$5]++ } END { for (type in types) print type }' planet-latest_geonames.tsv > all_uniques.txt
