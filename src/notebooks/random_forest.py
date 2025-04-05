# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.under_sampling import RandomUnderSampler
import shap
import matplotlib.pyplot as plt
from collections import Counter
import joblib


def train_random_forest(df):
    # Rename target column to match script expectation
    df = df.rename(columns={'status_label': 'label'})

    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    # Sort by pod and timestamp to ensure chronological order
    df = df.sort_values(['pod', 'timestamp'])

    # Compute pod-specific time since first observation
    df['time_since_pod_start'] = df.groupby('pod')['timestamp'].transform(lambda x: (x - x.min()).dt.total_seconds())

    # Updated feature columns to include additional dataset fields
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

    # Impute NaN values for all feature columns
    for col in ['cpu_usage', 'cpu_limit', 'cpu_request', 'memory_usage',
                'memory_limit', 'memory_request', 'memory_rss',
                'network_receive_bytes', 'network_transmit_bytes', 'network_errors',
                'disk_read_bytes', 'disk_write_bytes',
                'pod_uptime_seconds', 'cpu_utilization_ratio',
                'memory_utilization_ratio', 'time_since_pod_start']:
        df[col] = df[col].fillna(df[col].mean())

    # Impute with 0 for count-like or binary variables
    for col in ['restarts', 'CPU Throttling', 'High CPU Usage',
                'OOMKilled (Out of Memory)', 'CrashLoopBackOff', 'ContainerNotReady',
                'PodUnschedulable', 'NodePressure', 'ImagePullFailure']:
        df[col] = df[col].fillna(0)

    # Verify no NaN values remain in feature_cols or label
    print("NaN count in features after imputation:\n", df[feature_cols].isna().sum())
    print("NaN count in label after imputation:", df['label'].isna().sum())

    # Impute label with mode if NaN exists
    if df['label'].isna().sum() > 0:
        df['label'] = df['label'].fillna(df['label'].mode()[0])

    print(f"Rows after processing: {df.shape[0]}")

    # Encode the labels ('Bad', 'Alert', 'Good') to numerical values
    label_encoder = LabelEncoder()
    df['encoded_label'] = label_encoder.fit_transform(df['label'])

    X = df[feature_cols]
    y = df['encoded_label']

    # Split data, ensuring stratification by label
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    train_idx = X_train.index
    test_idx = X_test.index

    # Scale data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Handle any remaining NaN in scaled data
    X_train_scaled = np.nan_to_num(X_train_scaled, nan=0)
    X_test_scaled = np.nan_to_num(X_test_scaled, nan=0)

    # Dynamic sampling strategy for multi-class using undersampling
    class_counts = Counter(y_train)
    min_class_count = min(class_counts.values())
    sampling_strategy = {cls: min_class_count for cls in class_counts}

    # Apply undersampling
    undersampler = RandomUnderSampler(sampling_strategy=sampling_strategy, random_state=42)
    X_train_resampled, y_train_resampled = undersampler.fit_resample(X_train_scaled, y_train)

    # Check resampled class distribution
    print(f"Resampled class distribution: {dict(zip(*np.unique(y_train_resampled, return_counts=True)))}")

    # Train Random Forest
    rf_classifier = RandomForestClassifier(
        n_estimators=50, max_depth=5, min_samples_split=10,
        random_state=42, n_jobs=-1
    )
    rf_classifier.fit(X_train_resampled, y_train_resampled)

    # Cross-validation
    scores = cross_val_score(rf_classifier, X_train_resampled, y_train_resampled, cv=5, scoring='f1_weighted')
    print(f"Cross-validation F1 scores: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")

    # Evaluate on test data
    y_pred = rf_classifier.predict(X_test_scaled)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")

    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': rf_classifier.feature_importances_
    }).sort_values('importance', ascending=False)
    print("\nFeature Importance:")
    print(feature_importance)

    # SHAP explainability
    explainer = shap.TreeExplainer(rf_classifier)
    shap_values = explainer.shap_values(X_test_scaled)
    shap.summary_plot(shap_values, X_test, feature_names=feature_cols)
    plt.savefig('shap_summary.png')  # Save SHAP plot
    plt.close()

    # Prediction results with metadata
    results = pd.DataFrame({
        'timestamp': df.loc[test_idx, 'timestamp'],
        'namespace': df.loc[test_idx, 'namespace'],
        'pod': df.loc[test_idx, 'pod'],
        'node': df.loc[test_idx, 'node'],
        'time_since_pod_start': df.loc[test_idx, 'time_since_pod_start'],
        'actual_label': label_encoder.inverse_transform(y_test),
        'predicted_label': label_encoder.inverse_transform(y_pred)
    })


    print("\nSample Predictions with Pod Details (Sorted by Pod and Time):")
    print(results.sort_values(['pod', 'timestamp']).head(10))


    import tempfile
    import os
    
    def safe_joblib_dump(obj, filename):
        """Safely save object with atomic write"""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            try:
                joblib.dump(obj, tmp.name)

                _ = joblib.load(tmp.name)

                os.replace(tmp.name, filename)
                print(f"✅ Saved {filename} ({os.path.getsize(filename)} bytes)")
            except Exception as e:
                if os.path.exists(tmp.name):
                    os.unlink(tmp.name)
                raise e

    try:
        safe_joblib_dump(rf_classifier, 'random_forest_model.pkl')
        safe_joblib_dump(scaler, 'scaler.pkl')
        safe_joblib_dump(label_encoder, 'label_encoder.pkl')
        print("\nAll model artifacts saved successfully!")
    except Exception as e:
        print(f"\n❌ Failed to save artifacts: {str(e)}")
        raise


    return rf_classifier, scaler, label_encoder

if __name__ == "__main__":
    df = pd.read_csv('../../data/labeled_k8s_metrics.csv')
    print("Data loaded successfully. Shape:", df.shape)
    model, scaler , label_encoder = train_random_forest(df)
