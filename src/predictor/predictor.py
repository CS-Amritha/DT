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
FEATURE_COLS_PODS = [
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
FEATURE_COLS_NODES =[
        'node_cpu_usage', 'node_cpu_usage_percent', 'nonde_cpu_load_1m_ratio',
        'node_cpu_capacity', 'node_cpu_allocatable', 'node_cpu_utilization_ratio',
        'node_memory_usage', 'node_memory_available_percent', 'node_swap_usage_percent',
        'node_memory_capacity', 'node_memory_allocatable',
        'node_disk_usage', 'node_disk_utilization_ratio', 'node_disk_io_time_percent',
        'node_network_receive_bytes', 'node_network_transmit_bytes', 'node_network_errors',
        'node_ready', 'node_memory_pressure', 'node_disk_pressure',
        'node_pid_pressure', 'node_unschedulable', 'node_age_seconds',
        'time_since_node_start'
    
]

# Load model artifacts based on type
if MODEL_TYPE == "nn":
    print("Using Neural Network model")
    model_pod = load_model(MODEL_PATH / "neural_net_model.keras")
    scaler_pod = joblib.load(MODEL_PATH / "scaler_nn.pkl")
    label_encoder_pod = joblib.load(MODEL_PATH / "label_encoder_nn.pkl")
    

    model_node = load_model(MODEL_PATH / "neural_net_model_nodes.keras")
    scaler_node = joblib.load(MODEL_PATH / "scaler_nn_nodes.pkl")
    label_encoder_node = joblib.load(MODEL_PATH / "label_encoder_nn_nodes.pkl")
    
    
else:
    print("Using Random Forest model")
    model = joblib.load(MODEL_PATH / "random_forest_model.pkl")
    scaler = joblib.load(MODEL_PATH / "scaler_rf.pkl")
    label_encoder = joblib.load(MODEL_PATH / "label_encoder.pkl")


def prepare_document_pods(doc):
    """
    Ensures all features are present, fills missing with 0/0.0, returns as DataFrame.
    """
    processed = {}
    for col in FEATURE_COLS_PODS:
        if col not in doc:
            processed[col] = 0 if col in POD_ERROR_TYPES else 0.0
        else:
            processed[col] = doc[col]
    return pd.DataFrame([processed])

def prepare_document_nodes(doc):
    """
    Ensures all features are present, fills missing with 0/0.0, returns as DataFrame.
    """
    processed = {}
    for col in FEATURE_COLS_NODES:
        if col not in doc:
            processed[col] = 0 if col in POD_ERROR_TYPES else 0.0
        else:
            processed[col] = doc[col]
    return pd.DataFrame([processed])
def predict_for_pod(doc):
    """
    Predicts class and probabilities for a single input document using selected model.
    Replaces NaNs with None to make the result JSON serializable.
    """ 
    try:
        X = prepare_document_pods(doc)
        X_scaled = scaler_pod.transform(X)

        if MODEL_TYPE == "nn":
            y_proba = model_pod.predict(X_scaled)[0]
            y_pred = [np.argmax(y_proba)]
        else:
            y_pred = model_pod.predict(X_scaled)
            y_proba = model_pod.predict_proba(X_scaled)[0]

        label = label_encoder_pod.inverse_transform(y_pred)[0]
        doc["predicted_label"] = label

        for i, cls in enumerate(label_encoder_pod.classes_):
            doc[f"prob_{cls}"] = float(y_proba[i])

        # Replace NaNs with None for JSON safety
        return {k: (0 if pd.isna(v) else v) for k, v in doc.items()}
    except Exception as e:
        return {"error": str(e)}
    
def predict_for_node(doc):
    """
    Predicts class and probabilities for a single input document using selected model.
    Replaces NaNs with None to make the result JSON serializable.
    """
    try:
        X = prepare_document_nodes(doc)
        X_scaled = scaler_node.transform(X)

        if MODEL_TYPE == "nn":
            y_proba = model_node.predict(X_scaled)[0]
            y_pred = [np.argmax(y_proba)]
        else:
            y_pred = model_node.predict(X_scaled)
            y_proba = model_node.predict_proba(X_scaled)[0]

        label = label_encoder_node.inverse_transform(y_pred)[0]
        doc["predicted_label"] = label

        for i, cls in enumerate(label_encoder_node.classes_):
            doc[f"prob_{cls}"] = float(y_proba[i])

        # Replace NaNs with None for JSON safety
        return {k: (0 if pd.isna(v) else v) for k, v in doc.items()}
    except Exception as e:
        return {"error": str(e)}




