import json
import csv


def flatten_json(data, country_code):
    result = []
    for state_name, state_data in data[">"].items():
        if ">" in state_data:
            for city_name, city_data in state_data[">"].items():
                if (
                    "g" in city_data
                    and isinstance(city_data["g"], list)
                    and len(city_data["g"]) == 2
                ):
                    result.append(
                        {
                            "name": city_name,
                            "country_code": country_code.lower(),
                            "state_name": state_name,
                            "latitude": city_data["g"][0],
                            "longitude": city_data["g"][1],
                        }
                    )
    return result


def json_to_tsv(json_data, output_file):
    flattened_data = []
    for country_code, country_data in json_data.items():
        flattened_data.extend(flatten_json(country_data, country_code))

    with open(output_file, "w", newline="", encoding="utf-8") as tsv_file:
        fieldnames = ["name", "country_code", "state_name", "latitude", "longitude"]
        writer = csv.DictWriter(tsv_file, fieldnames=fieldnames, delimiter="\t")

        writer.writeheader()
        for row in flattened_data:
            if row["latitude"] == 0 and row["longitude"] == 0:
                continue
            writer.writerow(row)


# Load JSON data
with open("GPS-data.json", "r", encoding="utf-8") as json_file:
    json_data = json.load(json_file)

# Convert JSON to TSV
json_to_tsv(json_data, "gps-data-tsv.tsv")

print("TSV file has been created successfully.")
