#!/bin/bash

# Set error handling
set -euo pipefail

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found in PATH"
    exit 1
fi

# Validate input arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <input_csv> [--no-labels] [--model rf|nn]"
    echo "Example: $0 test_data.csv --model rf"
    echo "Example: $0 new_data.csv --no-labels --model nn"
    exit 1
fi

# Default model type
model_type="rf"
no_labels=false
input_csv=""
output_file=""

# Parse arguments
for arg in "$@"; do
    case $arg in
        --model)
            shift
            model_type="$1"
            ;;
        --no-labels)
            no_labels=true
            ;;
        *.csv)
            input_csv="$arg"
            ;;
    esac
    shift || true
done

# Verify input file
if [ -z "$input_csv" ] || [ ! -f "$input_csv" ]; then
    echo "Error: Input CSV file is missing or does not exist"
    exit 1
fi

# Set default output file
output_file="${input_csv%.*}_predictions.csv"

# Verify required files based on model
required_common=("test/predict_from_csv.py")
required_rf=(
    "./models/random_forest_model.pkl"
    "./models/scaler_rf.pkl"
    "./models/label_encoder_rf.pkl"
)
required_nn=(
    "./models/neural_net_model.keras"
    "./models/scaler_nn.pkl"
    "./models/label_encoder_nn.pkl"
)

if [ "$model_type" = "rf" ]; then
    required_files=("${required_common[@]}" "${required_rf[@]}")
elif [ "$model_type" = "nn" ]; then
    required_files=("${required_common[@]}" "${required_nn[@]}")
else
    echo "Error: Unsupported model type '$model_type'. Use 'rf' or 'nn'."
    exit 1
fi

# Check for required files
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Error: Required file '$file' not found"
        exit 1
    fi
done

# Run the prediction
cmd=(python3 test/predict_from_csv.py "$input_csv" --model "$model_type" --output "$output_file")
if $no_labels; then
    cmd+=(--no-labels)
fi

# Execute
"${cmd[@]}"

# Final confirmation
if [ -f "$output_file" ]; then
    echo "Success: Predictions saved to $output_file"
else
    echo "Warning: Script completed but output file not found"
    exit 1
fi
