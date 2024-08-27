import numpy as np
import pandas as pd

# Define input and output file paths
csv_file = "generated_data/turkish_cities.csv"
tsv_file = "generated_data/filtered_geonames.tsv"
output_file = "generated_data/db.tsv"
gps_data_file = "generated_data/gps-data-tsv.tsv"

# Load the CSV and TSV files
csv_df = pd.read_csv(csv_file)
tsv_df = pd.read_csv(tsv_file, sep="\t")
gps_data_df = pd.read_csv(gps_data_file, sep="\t")

# Rename columns in TSV to match CSV
tsv_df.rename(
    columns={"state": "state_name", "lat": "latitude", "lon": "longitude"}, inplace=True
)


# Function to check and print rows with latitude and longitude (0.0, 0.0)
def check_zero_lat_lon(df, operation_name):
    zero_lat_lon_df = df[(df["latitude"] == 0.0) & (df["longitude"] == 0.0)]
    if not zero_lat_lon_df.empty:
        print(
            f"After {operation_name}, the following places have (0.0, 0.0) latitude and longitude:"
        )
        print(zero_lat_lon_df)
    else:
        print(
            f"No (0.0, 0.0) latitude and longitude places found after {operation_name}."
        )


check_zero_lat_lon(tsv_df, "loading TSV")
check_zero_lat_lon(gps_data_df, "loading GPS data")


def merge_on_name_and_country(df1, df2):
    """df1 overrides df2 if some data exist in both of them"""
    # Merge the two data frames on 'name' and 'country_code'
    merged_df = pd.merge(
        df1,
        df2,
        on=["name", "country_code"],
        how="outer",
    )
    # Create a new DataFrame with the desired column names
    final_df = pd.DataFrame()

    # Copy 'name' and 'country_code' columns directly
    final_df["name"] = merged_df["name"]
    final_df["country_code"] = merged_df["country_code"]

    # List of columns to check and merge
    columns_to_merge = ["state_name", "latitude", "longitude"]

    # Iterate through the columns and choose values from CSV if present, otherwise from TSV
    for col in columns_to_merge:
        final_df[col] = merged_df[f"{col}_x"].combine_first(merged_df[f"{col}_y"])

    # Add the 'alternative_names' column from TSV
    final_df["alternative_names"] = merged_df["alternative_names"]
    return final_df


final_df = merge_on_name_and_country(
    merge_on_name_and_country(csv_df, tsv_df), gps_data_df
)


# Remove duplicates based on 'name', 'country_code', 'state_name', 'latitude', and 'longitude'
final_df.drop_duplicates(
    subset=["name", "country_code", "state_name", "latitude", "longitude"], inplace=True
)

# Trim leading and trailing spaces
columns_to_trim = ["name", "country_code", "state_name", "alternative_names"]
for col in columns_to_trim:
    final_df[col] = final_df[col].str.strip()

# Replace empty strings in specific columns with NaN
final_df.replace(
    {"name": "", "country_code": "", "state_name": ""}, np.nan, inplace=True
)

# Drop rows with NaN values in 'name', 'country_code', or 'state_name'
final_df.dropna(subset=["name", "country_code", "state_name"], inplace=True)


# Sort the DataFrame to make the file look tidy
sorted_df = final_df.sort_values(by=["country_code", "state_name", "name"])


# Save the final dataframe to a TSV file
sorted_df.to_csv(output_file, sep="\t", index=False)

print(f"Merge complete. Output saved to {output_file}")
