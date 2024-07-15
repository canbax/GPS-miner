#!/bin/bash

# Download planet-latest_geonames.tsv from OSMNames github repository https://github.com/OSMNames/OSMNames/
# Currently the last release is v2.2.0 served https://github.com/OSMNames/OSMNames/releases/tag/v2.2.0
# Since this file is kind a large, the script assumes the file exists in "data" folder. The "data" folder is ignored in git due to its large size.

# Start time
start_time=$(date +%s)

# Define the paths to your input TSV and the additional CSV file
OUTPUT_DIR="generated_data"
TSV_FILE="data/planet-latest_geonames.tsv"
CSV_FILE="generated_data/turkish_cities.csv"
OUTPUT_FILE="${OUTPUT_DIR}/filtered_geonames.tsv"

# Ensure the output directory exists
mkdir -p $OUTPUT_DIR

# Extract the names from the CSV file into an associative array
awk -F',' 'NR > 1 { names[$1] = 1 } END {
    # Save the names array to a temporary file
    for (name in names) {
        print name
    }
}' $CSV_FILE >names.txt

# Use awk to process the TSV file and filter based on the names from the CSV
awk -F'\t' '
BEGIN {
    # Load names from the temporary file into an array
    while ((getline name < "names.txt") > 0) {
        names[name] = 1;
    }
    close("names.txt");

    # Define the CITY_NAMES_EN_TO_TR mapping
    city_names["Istanbul"] = "İstanbul";
    city_names["Izmir"] = "İzmir";
    city_names["Kahramanmaras"] = "Kahramanmaraş";
    city_names["Kutahya"] = "Kütahya";
    city_names["Canakkale"] = "Çanakkale";
    city_names["Nigde"] = "Niğde";
    city_names["Diyarbakir"] = "Diyarbakır";
    city_names["Sanliurfa"] = "Şanlıurfa";
    city_names["Sirnak"] = "Şırnak";
    city_names["Aydin"] = "Aydın";
    city_names["Mugla"] = "Muğla";
    city_names["Elazig"] = "Elazığ";
    city_names["Nevsehir"] = "Nevşehir";
    city_names["Duzce"] = "Düzce";
    city_names["Corum"] = "Çorum";
    city_names["Gumushane"] = "Gümüşhane";
    city_names["Eskisehir"] = "Eskişehir";
    city_names["Tekirdag"] = "Tekirdağ";
    city_names["Agri"] = "Ağrı";
    city_names["Kirikkale"] = "Kırıkkale";
    city_names["Adiyaman"] = "Adıyaman";
    city_names["Usak"] = "Uşak";
    city_names["Balikesir"] = "Balıkesir";
    city_names["Bingol"] = "Bingöl";
    city_names["Karabuk"] = "Karabük";
    city_names["Cankiri"] = "Çankırı";
    city_names["Bartin"] = "Bartın";
    city_names["Kirsehir"] = "Kırşehir";
    city_names["Kirklareli"] = "Kırklareli";
    city_names["Mus"] = "Muş";
    city_names["Igdir"] = "Iğdır";
}
NR == 1 || (($11 == "" || $11 == "-") && ($3 == "relation" || $3 == "node") && ($7 != "" && $8 != "" && $22 != "") && ($5 == "multiple" || $5 == "place") && ($6 == "state_district" || $6 == "province" || $6 == "city" || $6 == "borough" || $6 == "district" || $6 == "subdistrict" || $6 == "municipality")) {
    if ($16 == "tr" && ($1 in city_names)) {
        $1 = city_names[$1];
    }
    if ($16 == "tr" && !($1 in names)) {
        next;
    }
    print $1,$2,$7,$8,$14,$16
}' OFS='\t' $TSV_FILE >$OUTPUT_FILE

# Clean up the temporary names file
rm names.txt

# End time
end_time=$(date +%s)

# Calculate the duration
duration=$((end_time - start_time))

echo "Time taken: $duration seconds"
