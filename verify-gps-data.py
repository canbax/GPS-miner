import pandas as pd
import json

gps_data_file = "gps-data-tsv.tsv"
output_file = "generated_data/db.tsv"

# Read the TSV files
gps_df = pd.read_csv(gps_data_file, sep="\t")
gps_df["name"] = gps_df["name"].str.strip()
gps_df = gps_df.dropna(subset=["name"])
gps_df["country_code"] = gps_df["country_code"].str.strip()
gps_df["state_name"] = gps_df["state_name"].str.strip()

output_df = pd.read_csv(output_file, sep="\t")

# Merge the dataframes on 'name' and 'country_code'
merged = pd.merge(
    gps_df, output_df, on=["name", "country_code"], how="left", indicator=True
)

# Find rows that are only in the first dataframe
missing_rows = merged[merged["_merge"] == "left_only"]

if missing_rows.empty:
    print("All data from the first file is present in the second file.")
else:
    print(
        f"There are {len(missing_rows)} rows from the first file that are missing in the second file:"
    )
    print(
        missing_rows[
            ["name", "country_code", "state_name_x", "latitude_x", "longitude_x"]
        ]
    )

    # Save missing rows to a new TSV file
    missing_rows[
        ["name", "country_code", "state_name_x", "latitude_x", "longitude_x"]
    ].to_csv("missing_data.tsv", sep="\t", index=False)
    print("Missing data has been saved to 'missing_data.tsv'")
