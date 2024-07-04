#!/bin/bash

# Define the URL of the CSV file
URL="https://github.com/dr5hn/countries-states-cities-database/raw/master/csv/cities.csv"

# Define the name of the local file and the directory to save the filtered file
FILE="cities.csv"
OUTPUT_DIR="generated_data"
OUTPUT_FILE="${OUTPUT_DIR}/turkish_cities.csv"

# Create the output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Download the CSV file
curl -L $URL -o $FILE

# Process the file
awk -F',' 'BEGIN {OFS=","} 
    NR==1 {print "name,state_name,country_code,latitude,longitude"} 
    $7 == "TR" {
        name = $2 == "Merkez" ? $5 : $2
        print name, $5, $7, $9, $10
    }' $FILE | 
    sed 's/Hakkâri/Hakkari/' > $OUTPUT_FILE

# Notify the user
echo "Processing complete. Filtered data saved in '$OUTPUT_FILE'."
