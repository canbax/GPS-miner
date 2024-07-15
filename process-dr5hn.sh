#!/bin/bash

# Define the URL of the CSV file
URL="https://github.com/dr5hn/countries-states-cities-database/raw/master/csv/cities.csv"

# Define the name of the local file and the directory to save the filtered file
FILE="cities.csv"
OUTPUT_DIR="generated_data"
OUTPUT_FILE="${OUTPUT_DIR}/turkish_cities.csv"
TEMP_FILE="temp_filtered_cities.csv"
SUMMARY_FILE="temp_summary.csv"

# Create the output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Download the CSV file
curl -L $URL -o $FILE

# Process the file to filter and replace "Merkez" with state name
awk -F',' 'BEGIN {OFS=","} 
    NR==1 {next} 
    $7 == "TR" {
        name = $2 == "Merkez" ? $5 : $2
        print name, $5, tolower($7), $9, $10
    }' $FILE | sed 's/Hakkâri/Hakkari/' > $TEMP_FILE

# Generate state-wise summaries if the state name is not present as a city name
awk -F',' 'BEGIN {OFS=","}
    NR == 1 {next}
    {
        state = $2
        if ($1 == state) {
            states[state] = 1
        }
        lat[state] += $4
        lon[state] += $5
        count[state]++
        data[state] = $2
    }
    END {
        for (s in data) {
            if (!(s in states)) {
                avg_lat = lat[s] / count[s]
                avg_lon = lon[s] / count[s]
                print s, s, "tr", avg_lat, avg_lon
            }
        }
    }
' $TEMP_FILE > $SUMMARY_FILE

# Combine the header, summary, and filtered data into the final output file
{
    echo "name,state_name,country_code,latitude,longitude"
    cat $SUMMARY_FILE
    cat $TEMP_FILE
} > $OUTPUT_FILE

# Notify the user
echo "Processing complete. Filtered data saved in '$OUTPUT_FILE'."

# Clean up temporary files
rm $TEMP_FILE $SUMMARY_FILE
