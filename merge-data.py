import numpy as np
import pandas as pd

# Define input and output file paths
csv_file = "generated_data/turkish_cities.csv"
tsv_file = "generated_data/filtered_geonames.tsv"
output_file = "generated_data/db.tsv"
gps_data_file = "gps-data-tsv.tsv"

# Load the CSV and TSV files
csv_df = pd.read_csv(csv_file)
tsv_df = pd.read_csv(tsv_file, sep="\t")
gps_data_df = pd.read_csv(gps_data_file, sep="\t")

# Rename columns in TSV to match CSV
tsv_df.rename(
    columns={"state": "state_name", "lat": "latitude", "lon": "longitude"}, inplace=True
)


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


def interleave_bits(x: int, y: int) -> int:
    """Interleave the bits of two integers to produce a Morton code (Z-order curve)."""
    z = 0
    for i in range(32):
        z |= (x & (1 << i)) << i | (y & (1 << i)) << (i + 1)
    return z


def normalize_latitude(latitude: float) -> int:
    """Normalize latitude from -90 to 90 to a 0-65535 range."""
    return int(((latitude + 90) / 180) * 0xFFFF)


def normalize_longitude(longitude: float) -> int:
    """Normalize longitude from -180 to 180 to a 0-65535 range."""
    return int(((longitude + 180) / 360) * 0xFFFF)


def calculate_morton_code(latitude: float, longitude: float) -> int:
    """Calculate the Morton code for a given latitude and longitude."""
    x = normalize_latitude(latitude)
    y = normalize_longitude(longitude)
    return interleave_bits(x, y)


# Add a new column for the sorting key (optional)
final_df["sort_key"] = final_df.apply(lambda row: calculate_morton_code(row['latitude'], row['longitude']), axis=1)


# Sort the DataFrame
sorted_df = final_df.sort_values(by="sort_key")

# Drop the sort_key column if you added it
sorted_df = sorted_df.drop(columns=["sort_key"])

# Save the final dataframe to a TSV file
sorted_df.to_csv(output_file, sep="\t", index=False)

print(f"Merge complete. Output saved to {output_file}")
