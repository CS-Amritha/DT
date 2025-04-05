#!/bin/bash

# Run predictions on CSV files
# Usage: ./run_predictions.sh <input_csv> [--no-labels]

# Set error handling
set -euo pipefail

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found in PATH"
    exit 1
fi

# Verify all required files exist
required_files=(
    "predict_from_csv.py"
    "../models/random_forest_model.pkl"
    "../models/scaler.pkl"
    "../models/label_encoder.pkl"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Error: Required file '$file' not found in current directory"
        exit 1
    fi
done  # Fixed: removed the semicolon before done

# Validate input
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    echo "Usage: $0 <input_csv> [--no-labels]"
    echo "Example: $0 test_data.csv"
    echo "Example: $0 new_data.csv --no-labels"
    exit 1
fi

input_csv="$1"
shift  # Remove the first argument so we can check the remaining ones

# Handle optional --no-labels flag
no_labels=false
if [ $# -gt 0 ] && [ "$1" == "--no-labels" ]; then
    no_labels=true
fi

# Verify input file exists
if [ ! -f "$input_csv" ]; then
    echo "Error: Input file '$input_csv' not found"
    exit 1
fi

# Run the prediction with proper argument handling
output_file="${input_csv%.*}_predictions.csv"

if $no_labels; then
    python3 predict_from_csv.py "$input_csv" --no-labels --output "$output_file"
else
    python3 predict_from_csv.py "$input_csv" --output "$output_file"
fi


# Check exit status
if [ $? -eq 0 ]; then
    output_file="${input_csv%.*}_predictions.csv"
    if [ -f "$output_file" ]; then
        echo "Success: Predictions saved to $output_file"
    else
        echo "Warning: Script completed but output file not found"
    fi
else
    echo "Error: Prediction failed"
    exit 1
fi