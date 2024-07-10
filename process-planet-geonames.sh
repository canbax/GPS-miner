#!/bin/bash

# Download planet-latest_geonames.tsv from OSMNames github repository https://github.com/OSMNames/OSMNames/ 
# Currently the last release is v2.2.0 served https://github.com/OSMNames/OSMNames/releases/tag/v2.2.0 
# Since this file is kind a large, the script assumes the file exists in "data" folder. The "data" folder is ignored in git due to its large size.

FILE="data/planet-latest_geonames.tsv"
OUTPUT_DIR="generated_data"
OUTPUT_FILE="${OUTPUT_DIR}/filtered_geonames.tsv"

# Start time
start_time=$(date +%s)

# try to filter out all places that are a municipality
awk -F'\t' 'NR==1 || (($11 == "" || $11 == "-") && ($3 == "relation" || $3 == "node") && ($7 != "" && $8 != "" && $22 != "") && ($5 == "multiple" || $5 == "place") && ($6 == "state_district" || $6 == "province" || $6 == "city" || $6 == "borough" || $6 == "district" || $6 == "subdistrict" || $6 == "municipality") ) { print $1,$2,$7,$8,$14,$16 }' OFS='\t' $FILE > $OUTPUT_FILE

# End time
end_time=$(date +%s)

# Calculate the duration
duration=$(( end_time - start_time ))

echo "Time taken: $duration seconds"