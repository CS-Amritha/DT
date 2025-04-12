import numpy as np
import pandas as pd
from pathlib import Path
import joblib
from config.settings import POD_ERROR_TYPES

# Load models once at import
BASE_DIR = Path(__file__).resolve().parents[2] 
MODEL_PATH = BASE_DIR / "models"

model = joblib.load(MODEL_PATH / "random_forest_model.pkl")
scaler = joblib.load(MODEL_PATH / "scaler.pkl")
label_encoder = joblib.load(MODEL_PATH / "label_encoder.pkl")

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
    Predicts class and probabilities for a single input document, mutates and returns it.
    """
    try:
        X = prepare_document(doc)
        X_scaled = scaler.transform(X)
        y_pred = model.predict(X_scaled)
        y_proba = model.predict_proba(X_scaled)

        label = label_encoder.inverse_transform(y_pred)[0]
        doc["predicted_label"] = label

        for i, cls in enumerate(label_encoder.classes_):
            doc[f"prob_{cls}"] = y_proba[0][i]

        return doc
    except Exception as e:
        doc["prediction_error"] = str(e)
        return doc
