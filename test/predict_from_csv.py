import pandas as pd
import numpy as np
import joblib
import sys
from pathlib import Path

def load_models():
    """Load all model artifacts using joblib"""
    try:
        model = joblib.load('../models/random_forest_model.pkl')
        scaler = joblib.load('../models/scaler.pkl')
        label_encoder = joblib.load('../models/label_encoder.pkl')
        return model, scaler, label_encoder
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        sys.exit(1)

def prepare_data(df, feature_cols):
    """Prepare and validate input data"""
    # Ensure all required columns exist
    for col in feature_cols:
        if col not in df.columns:
            if col in ['CPU Throttling', 'High CPU Usage', 'OOMKilled (Out of Memory)',
                     'CrashLoopBackOff', 'ContainerNotReady', 'PodUnschedulable',
                     'NodePressure', 'ImagePullFailure']:
                df[col] = 0
            else:
                df[col] = 0.0
    
    # Handle timestamps if present
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        if 'pod' in df.columns:
            df['time_since_pod_start'] = df.groupby('pod')['timestamp'].transform(
                lambda x: (x - x.min()).dt.total_seconds())
    
    return df[feature_cols]

def main():
    if len(sys.argv) < 2:
        print("Usage: python predict_from_csv.py <input_csv> [--no-labels] [--output output_file]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    has_labels = '--no-labels' not in sys.argv
    output_file = None

    if '--output' in sys.argv:
        try:
            output_index = sys.argv.index('--output') + 1
            output_file = sys.argv[output_index]
        except IndexError:
            print("Error: Missing output file after --output")
            sys.exit(1)
    
    # Feature columns must match training
    feature_cols = [
        'cpu_usage', 'cpu_limit', 'cpu_request',
        'memory_usage', 'memory_limit', 'memory_request', 'memory_rss',
        'network_receive_bytes', 'network_transmit_bytes', 'network_errors',
        'disk_read_bytes', 'disk_write_bytes',
        'restarts', 'pod_uptime_seconds',
        'cpu_utilization_ratio', 'memory_utilization_ratio',
        'CPU Throttling', 'High CPU Usage', 'OOMKilled (Out of Memory)',
        'CrashLoopBackOff', 'ContainerNotReady', 'PodUnschedulable',
        'NodePressure', 'ImagePullFailure',
        'time_since_pod_start'
    ]
    
    # Load models
    model, scaler, label_encoder = load_models()
    
    # Load data
    try:
        df = pd.read_csv(input_file)
        X = prepare_data(df, feature_cols)
        
        if has_labels:
            label_col = 'label' if 'label' in df.columns else 'status_label'
            if label_col not in df.columns:
                raise ValueError("Label column not found in CSV")
            y_true = df[label_col]
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        sys.exit(1)
    
    # Make predictions
    try:
        X_scaled = scaler.transform(X)
        X_scaled = np.nan_to_num(X_scaled, nan=0)
        y_pred = model.predict(X_scaled)
        y_proba = model.predict_proba(X_scaled)
        pred_labels = label_encoder.inverse_transform(y_pred)
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        sys.exit(1)
    
    # Save results
    results = df.copy()
    results['predicted_label'] = pred_labels
    for i, cls in enumerate(label_encoder.classes_):
        results[f'prob_{cls}'] = y_proba[:, i]

    if not output_file:
        output_file = Path(input_file).with_name(Path(input_file).stem + '_predictions.csv')

    results.to_csv(output_file, index=False)
    print(f"Predictions saved to {output_file}")
    
    if has_labels:
        from sklearn.metrics import classification_report
        print("\nEvaluation Metrics:")
        print(classification_report(
            label_encoder.transform(y_true),
            y_pred,
            target_names=label_encoder.classes_
        ))

       


if __name__ == "__main__":
    main()
