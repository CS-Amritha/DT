import pandas as pd

# Replace with your input and output file paths
input_csv = "good.csv"
output_csv = "good_pods_filtered.csv"

# Read the CSV file
df = pd.read_csv(input_csv)

# Trim to the first 1200 rows
df = df.head(2000)

# Add the new column with value "good"
df["label"] = "good"

# Print total number of rows after trimming
print(f"Total number of rows after trimming: {len(df)}")

# Save the updated DataFrame to a new CSV file
df.to_csv(output_csv, index=False)

print(f"Label column added. Saved to {output_csv}")
