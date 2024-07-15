import pandas as pd

# Define input and output file paths
csv_file = "generated_data/turkish_cities.csv"
tsv_file = "generated_data/filtered_geonames.tsv"
output_file = "generated_data/db.tsv"

# Load the CSV and TSV files
csv_df = pd.read_csv(csv_file)
tsv_df = pd.read_csv(tsv_file, sep="\t")

# Rename columns in TSV to match CSV
tsv_df.rename(
    columns={"state": "state_name", "lat": "latitude", "lon": "longitude"}, inplace=True
)

# Merge the two data frames on 'name' and 'country_code'
merged_df = pd.merge(
    csv_df,
    tsv_df,
    on=["name", "country_code"],
    how="outer",
)

# Create a new DataFrame with the desired column names
final_df = pd.DataFrame()

# List of columns to check and merge
columns_to_merge = ["state_name", "latitude", "longitude"]

# Copy 'name' and 'country_code' columns directly
final_df["name"] = merged_df["name"]
final_df["country_code"] = merged_df["country_code"]

# Iterate through the columns and choose values from CSV if present, otherwise from TSV
for col in columns_to_merge:
    final_df[col] = merged_df[f"{col}_x"].combine_first(merged_df[f"{col}_y"])

# Add the 'alternative_names' column from TSV
final_df["alternative_names"] = merged_df["alternative_names"]

# Remove duplicates based on 'name', 'country_code', 'state_name', 'latitude', and 'longitude'
final_df.drop_duplicates(
    subset=["name", "country_code", "state_name", "latitude", "longitude"], inplace=True
)

# Save the final dataframe to a TSV file
final_df.to_csv(output_file, sep="\t", index=False)

print(f"Merge complete. Output saved to {output_file}")
