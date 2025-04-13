import pandas as pd

# Load the CSV files
good = pd.read_csv("good_pods_filtered.csv")
bad = pd.read_csv("bad_pods_filtered.csv")
alert = pd.read_csv("alert_pods_filtered.csv")

# Add a label column (to track source)
good['label'] = 'good'
bad['label'] = 'bad'
alert['label'] = 'alert'

# Print counts for each category
print(f"Good pods: {len(good)}")
print(f"Bad pods: {len(bad)}")
print(f"Alert pods: {len(alert)}")

# Combine the data
combined = pd.concat([good, bad, alert], ignore_index=True)

# Print total before shuffle
print(f"Total combined rows before shuffle: {len(combined)}")

# Shuffle the combined data
shuffled = combined.sample(frac=1, random_state=42).reset_index(drop=True)

# Save to a new CSV
output_file = "k8s_chaos_data.csv"
shuffled.to_csv(output_file, index=False)

# Final confirmation
print(f"Combined and shuffled CSV saved as '{output_file}' with {len(shuffled)} rows.")
