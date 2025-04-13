import pandas as pd
from src.config.settings import POD_ERROR_TYPES
import numpy as np
import joblib
import sys
from pathlib import Path
from sklearn.metrics import classification_report
import argparse
import os

# Conditional import
try:
    from tensorflow.keras.models import load_model as load_keras_model
except ImportError:
    load_keras_model = None


def load_models(model_type):
    """Load model, scaler, and encoder based on type: 'rf' or 'nn'"""
    try:
        if model_type == 'rf':
            model = joblib.load('./models/random_forest_model.pkl')
            scaler = joblib.load('./models/scaler_rf.pkl')
            label_encoder = joblib.load('./models/label_encoder_rf.pkl')
        elif model_type == 'nn':
            if load_keras_model is None:
                raise ImportError("TensorFlow is required for Neural Network model.")
            model = load_keras_model('./models/neural_net_model.keras')
            scaler = joblib.load('./models/scaler_nn.pkl')
            label_encoder = joblib.load('./models/label_encoder_nn.pkl')
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
        return model, scaler, label_encoder
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        sys.exit(1)


def prepare_data(df, feature_cols):
    """Prepare and validate input data"""
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0.0

    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        if 'pod' in df.columns:
            df['time_since_pod_start'] = df.groupby('pod')['timestamp'].transform(
                lambda x: (x - x.min()).dt.total_seconds())

    return df[feature_cols]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_csv", help="Input CSV file path")
    parser.add_argument("--model", choices=["rf", "nn"], default="rf", help="Model type to use: 'rf' or 'nn'")
    parser.add_argument("--no-labels", action="store_true", help="Specify if input has no labels")
    parser.add_argument("--output", help="Optional output CSV file path")
    args = parser.parse_args()

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

    model, scaler, label_encoder = load_models(args.model)

    try:
        df = pd.read_csv(args.input_csv)
        X = prepare_data(df, feature_cols)

        if not args.no_labels:
            label_col = 'label' if 'label' in df.columns else 'status_label'
            if label_col not in df.columns:
                raise ValueError("Label column not found in CSV")
            y_true = df[label_col]
        else:
            y_true = None
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        sys.exit(1)

    try:
        X_scaled = scaler.transform(X)
        X_scaled = np.nan_to_num(X_scaled, nan=0)

        if args.model == 'rf':
            y_pred = model.predict(X_scaled)
            y_proba = model.predict_proba(X_scaled)
        else:  # NN
            y_proba = model.predict(X_scaled)
            y_pred = np.argmax(y_proba, axis=1)

        pred_labels = label_encoder.inverse_transform(y_pred)
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        sys.exit(1)

    results = df.copy()
    results['predicted_label'] = pred_labels
    for i, cls in enumerate(label_encoder.classes_):
        results[f'prob_{cls}'] = y_proba[:, i]

    output_file = args.output or Path(args.input_csv).with_name(Path(args.input_csv).stem + '_predictions.csv')
    results.to_csv(output_file, index=False)
    print(f"Predictions saved to {output_file}")

    if y_true is not None:
        print("\nEvaluation Metrics:")
        print(classification_report(
            label_encoder.transform(y_true),
            y_pred,
            target_names=label_encoder.classes_
        ))


if __name__ == "__main__":
    main()
