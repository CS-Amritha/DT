import os
import numpy as np
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
import joblib
from config.settings import POD_ERROR_TYPES
from tensorflow.keras.models import load_model

# Load environment variables
load_dotenv()

# Paths and setup
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models"
MODEL_TYPE = os.getenv("MODEL_TYPE", "rf")  # Default to Random Forest

# Feature columns used for both models
FEATURE_COLS = [
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

# Load model artifacts based on type
if MODEL_TYPE == "nn":
    print("Using Neural Network model")
    model = load_model(MODEL_PATH / "neural_net_model.keras")
    scaler = joblib.load(MODEL_PATH / "scaler_nn.pkl")
    label_encoder = joblib.load(MODEL_PATH / "label_encoder_nn.pkl")
else:
    print("Using Random Forest model")
    model = joblib.load(MODEL_PATH / "random_forest_model.pkl")
    scaler = joblib.load(MODEL_PATH / "scaler_rf.pkl")
    label_encoder = joblib.load(MODEL_PATH / "label_encoder.pkl")


def prepare_document(doc):
    """
    Ensures all features are present, fills missing with 0/0.0, returns as DataFrame.
    """
    processed = {}
    for col in FEATURE_COLS:
        if col not in doc:
            processed[col] = 0 if col in POD_ERROR_TYPES else 0.0
        else:
            processed[col] = doc[col]
    return pd.DataFrame([processed])


def predict_for_document(doc):
    """
    Predicts class and probabilities for a single input document using selected model.
    """
    try:
        X = prepare_document(doc)
        X_scaled = scaler.transform(X)

        if MODEL_TYPE == "nn":
            y_proba = model.predict(X_scaled)[0]
            y_pred = [np.argmax(y_proba)]
        else:
            y_pred = model.predict(X_scaled)
            y_proba = model.predict_proba(X_scaled)[0]

        label = label_encoder.inverse_transform(y_pred)[0]
        doc["predicted_label"] = label

        for i, cls in enumerate(label_encoder.classes_):
            doc[f"prob_{cls}"] = float(y_proba[i])

        return doc
    except Exception as e:
        doc["prediction_error"] = str(e)
        return doc
