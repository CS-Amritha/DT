import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import RandomOverSampler
from collections import Counter
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import to_categorical
import joblib
import os
import tempfile
import matplotlib.pyplot as plt
import seaborn as sns


# For reproducibility
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

def train_optimized_neural_network(df):
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

    # Impute missing values
    for col in feature_cols:
        df[col] = df[col].fillna(df[col].mean())
    for col in ['restarts', 'CPU Throttling', 'High CPU Usage', 'OOMKilled (Out of Memory)',
                'CrashLoopBackOff', 'ContainerNotReady', 'PodUnschedulable',
                'NodePressure', 'ImagePullFailure']:
        df[col] = df[col].fillna(0)

    # Encode labels
    label_encoder = LabelEncoder()
    df['encoded_label'] = label_encoder.fit_transform(df['label'])

    X = df[feature_cols]
    y = df['encoded_label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Custom oversampling: Boost "alert" class more than current, but not equally
    y_train_counts = Counter(y_train)
    alert_class = list(label_encoder.classes_).index("alert")
    custom_strategy = {cls: max(count, y_train_counts[alert_class] * 3) for cls, count in y_train_counts.items()}
    print(f"Custom oversampling strategy: {custom_strategy}")

    over_sampler = RandomOverSampler(sampling_strategy=custom_strategy, random_state=SEED)
    X_resampled, y_resampled = over_sampler.fit_resample(X_train_scaled, y_train)
    print(f"Resampled label distribution: {Counter(y_resampled)}")

    y_train_cat = to_categorical(y_resampled)
    y_test_cat = to_categorical(y_test)

    # Neural Network
    model = Sequential([
        Dense(256, activation='relu', input_shape=(X.shape[1],)),
        BatchNormalization(),
        Dropout(0.3),
        Dense(128, activation='relu'),
        Dropout(0.2),
        Dense(64, activation='relu'),
        Dropout(0.1),
        Dense(len(label_encoder.classes_), activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # Early stopping
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    model.fit(
        X_resampled, y_train_cat,
        epochs=50,
        batch_size=32,
        validation_split=0.1,
        callbacks=[early_stop],
        verbose=1
    )

    # Evaluation
    y_pred_probs = model.predict(X_test_scaled)
    y_pred = np.argmax(y_pred_probs, axis=1)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")

    # Plot and save heatmap
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix - Neural Network')

    cm_path = os.path.join("models", "nn_confusion_matrix.png")
    plt.savefig(cm_path, bbox_inches='tight')
    plt.close()
    print(f"Confusion matrix heatmap saved at: {cm_path}")
    
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

    model.save("models/neural_net_model.keras")
    safe_joblib_dump(scaler, "models/scaler_nn.pkl")
    safe_joblib_dump(label_encoder, "models/label_encoder_nn.pkl")
    print("All optimized neural network artifacts saved!")

    return model, scaler, label_encoder


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, '../../data/k8s_chaos_data.csv')
    df = pd.read_csv(data_path)
    print("Data loaded successfully. Shape:", df.shape)
    model, scaler, label_encoder = train_optimized_neural_network(df)
