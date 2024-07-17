import pandas as pd
import json


def turkish_lower(s):
    if not isinstance(s, str):
        return s
    return s.replace("I", "ı").replace("İ", "i").lower()


# Read the TSV file
df = pd.read_csv("generated_data/db.tsv", sep="\t")

# Filter for Turkey and get city names
tsv_cities = set(
    df[df["country_code"].str.lower() == "tr"]["name"].apply(turkish_lower)
)

# Read the JSON file
with open("turkey_map.json", "r", encoding="utf-8") as f:
    turkey_map = json.load(f)

# Flatten the JSON data into a set of city names
ts_cities = set(
    turkish_lower(city) for cities in turkey_map.values() for city in cities
)
ts_states = set(turkish_lower(state) for state in turkey_map.keys())
# JSON is a bit wrong, sometimes it doesn't contain city centre in the cities list
ts_cities = ts_cities | ts_states

# Compare the sets
missing_in_ts = tsv_cities - ts_cities
missing_in_tsv = ts_cities - tsv_cities

print("Cities in TSV but not in JSON:")
for city in missing_in_ts:
    print(f"- {city}")

print("\nCities in JSON but not in TSV:")
for city in missing_in_tsv:
    print(f"- {city}")

print(f"\nTotal cities in TSV: {len(tsv_cities)}")
print(f"Total cities in JSON: {len(ts_cities)}")

# Additional analysis
if len(tsv_cities) == len(ts_cities) and len(missing_in_ts) == 0:
    print("\nThe datasets match perfectly!")
else:
    print("\nThere are discrepancies between the datasets.")

    # Check for potential case mismatches or close matches
    for tsv_city in missing_in_ts:
        close_matches = [
            ts_city
            for ts_city in ts_cities
            if turkish_lower(ts_city) == turkish_lower(tsv_city)
        ]
        if close_matches:
            print(
                f"Possible case mismatch: '{tsv_city}' in TSV, '{close_matches[0]}' in JSON"
            )

# State-level comparison
tsv_states = set(
    df[df["country_code"].str.lower() == "tr"]["state_name"].apply(turkish_lower)
)

missing_states_in_ts = tsv_states - ts_states
missing_states_in_tsv = ts_states - tsv_states

print("\nStates in TSV but not in JSON:")
for state in missing_states_in_ts:
    print(f"- {state}")

print("\nStates in JSON but not in TSV:")
for state in missing_states_in_tsv:
    print(f"- {state}")

# Detailed state-city comparison
print("\nDetailed state-city comparison:")
for state, cities in turkey_map.items():
    state_lower = turkish_lower(state)
    if state_lower in tsv_states:
        tsv_state_cities = set(
            df[
                (df["country_code"].str.lower() == "tr")
                & (df["state_name"].apply(turkish_lower) == state_lower)
            ]["name"].apply(turkish_lower)
        )
        json_state_cities = set(turkish_lower(city) for city in cities) | set([state])

        missing_in_json = tsv_state_cities - json_state_cities
        missing_in_tsv = json_state_cities - tsv_state_cities

        if missing_in_json or missing_in_tsv:
            print(f"\nState: {state}")
            if missing_in_json:
                print("  Cities in TSV but not in JSON:")
                for city in missing_in_json:
                    print(f"  - {city}")
            if missing_in_tsv:
                print("  Cities in JSON but not in TSV:")
                for city in missing_in_tsv:
                    print(f"  - {city}")
