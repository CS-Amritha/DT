import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import shap
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import tempfile


def train_random_forest(df):
    os.makedirs("models", exist_ok=True)

    df = df.rename(columns={'status_label': 'label'})
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(['pod', 'timestamp'])
    df['time_since_pod_start'] = df.groupby('pod')['timestamp'].transform(lambda x: (x - x.min()).dt.total_seconds())

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

    # Impute missing features
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0.0
        df[col] = df[col].fillna(df[col].mean() if df[col].dtype != 'object' else 0)

    # Encode label
    df['label'] = df['label'].fillna(df['label'].mode()[0])
    label_encoder = LabelEncoder()
    df['encoded_label'] = label_encoder.fit_transform(df['label'])

    X = df[feature_cols]
    y = df['encoded_label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    train_idx = X_train.index
    test_idx = X_test.index

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    rf_classifier = RandomForestClassifier(
        n_estimators=50, max_depth=5, min_samples_split=10,
        random_state=42, n_jobs=-1
    )
    rf_classifier.fit(X_train_scaled, y_train)

    scores = cross_val_score(rf_classifier, X_train_scaled, y_train, cv=5, scoring='f1_weighted')
    print(f"Cross-validation F1 scores: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")

    y_pred = rf_classifier.predict(X_test_scaled)
    cm = confusion_matrix(y_test, y_pred)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    print("\nConfusion Matrix:\n", cm)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")

    # Confusion Matrix Heatmap
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_)
    plt.title("Confusion Matrix - Random Forest")
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.savefig("models/confusion_matrix_rf.png", bbox_inches="tight")
    plt.close()

    # SHAP Explainability
    explainer = shap.TreeExplainer(rf_classifier)
    shap_values = explainer.shap_values(X_test_scaled)
    shap.summary_plot(shap_values, X_test, feature_names=feature_cols, show=False)
    plt.savefig("models/shap_summary_rf.png", bbox_inches="tight")
    plt.close()

    # Save artifacts
    def safe_joblib_dump(obj, filename):
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            try:
                joblib.dump(obj, tmp.name)
                _ = joblib.load(tmp.name)
                os.replace(tmp.name, filename)
                print(f"Saved {filename} ({os.path.getsize(filename)} bytes)")
            except Exception as e:
                if os.path.exists(tmp.name):
                    os.unlink(tmp.name)
                raise e

    safe_joblib_dump(rf_classifier, "models/random_forest_model.pkl")
    safe_joblib_dump(scaler, "models/scaler_rf.pkl")
    safe_joblib_dump(label_encoder, "models/label_encoder_rf.pkl")

    return rf_classifier, scaler, label_encoder


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '../../data/k8s_chaos_data.csv')
    df = pd.read_csv(data_path)
    print("Data loaded successfully. Shape:", df.shape)
    model, scaler, label_encoder = train_random_forest(df)
