import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, KFold
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import RandomOverSampler
from collections import Counter
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.regularizers import l2
import joblib
import os
import tempfile
import matplotlib.pyplot as plt
import seaborn as sns

# For reproducibility
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

def train_optimized_node_neural_network(df):
    # Create models directory
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)

    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(['node_name', 'timestamp'])
    df['time_since_node_start'] = df.groupby('node_name')['timestamp'].transform(lambda x: (x - x.min()).dt.total_seconds())

    feature_cols = [
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

    # Impute missing values
    for col in feature_cols:
        df[col] = df[col].fillna(df[col].mean())
    for col in ['node_ready', 'node_memory_pressure', 'node_disk_pressure',
                'node_pid_pressure', 'node_unschedulable']:
        df[col] = df[col].fillna(0)

    # Encode labels
    label_encoder = LabelEncoder()
    df['encoded_label'] = label_encoder.fit_transform(df['label'])

    X = df[feature_cols]
    y = df['encoded_label']

    # Add noise to numerical features to simulate data variation
    def add_noise(X, noise_factor=0.01):
        noise = np.random.normal(0, noise_factor, X.shape)
        return X + noise

    # K-Fold Cross-Validation
    kfold = KFold(n_splits=5, shuffle=True, random_state=SEED)
    accuracies = []
    fold_results = []

    for fold, (train_idx, val_idx) in enumerate(kfold.split(X, y)):
        print(f"\nTraining Fold {fold + 1}/5")
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        # Scale
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_val_scaled = scaler.transform(X_val)

        # Add noise to training data
        X_train_scaled = add_noise(X_train_scaled, noise_factor=0.01)

        # Oversampling (less aggressive)
        y_train_counts = Counter(y_train)
        alert_class = list(label_encoder.classes_).index("alert")
        custom_strategy = {cls: max(count, int(y_train_counts[alert_class] * 1.5)) for cls, count in y_train_counts.items()}
        print(f"Fold {fold + 1} Oversampling strategy: {custom_strategy}")

        over_sampler = RandomOverSampler(sampling_strategy=custom_strategy, random_state=SEED)
        X_resampled, y_resampled = over_sampler.fit_resample(X_train_scaled, y_train)
        print(f"Fold {fold + 1} Resampled label distribution: {Counter(y_resampled)}")

        y_train_cat = to_categorical(y_resampled)
        y_val_cat = to_categorical(y_val)

        # Simplified Neural Network with L2 Regularization
        model = Sequential([
            Dense(128, activation='relu', input_shape=(X.shape[1],), kernel_regularizer=l2(0.01)),
            BatchNormalization(),
            Dropout(0.4),  # Increased dropout
            Dense(64, activation='relu', kernel_regularizer=l2(0.01)),
            Dropout(0.3),
            Dense(32, activation='relu', kernel_regularizer=l2(0.01)),
            Dropout(0.2),
            Dense(len(label_encoder.classes_), activation='softmax')
        ])

        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),  # Lower learning rate
                      loss='categorical_crossentropy',
                      metrics=['accuracy'])

        # Early stopping with more patience
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

        model.fit(
            X_resampled, y_train_cat,
            epochs=30,
            batch_size=64,  # Larger batch size
            validation_data=(X_val_scaled, y_val_cat),
            callbacks=[early_stop],
            verbose=1
        )

        # Evaluation
        y_pred_probs = model.predict(X_val_scaled)
        y_pred = np.argmax(y_pred_probs, axis=1)

        print(f"\nFold {fold + 1} Classification Report:")
        print(classification_report(y_val, y_pred, target_names=label_encoder.classes_))
        print(f"Fold {fold + 1} Confusion Matrix:")
        print(confusion_matrix(y_val, y_pred))
        fold_accuracy = accuracy_score(y_val, y_pred)
        print(f"Fold {fold + 1} Accuracy: {fold_accuracy:.4f}")
        accuracies.append(fold_accuracy)
        fold_results.append((y_val, y_pred))

    # Average accuracy across folds
    print(f"\nMean Cross-Validation Accuracy: {np.mean(accuracies):.4f} (±{np.std(accuracies):.4f})")

    # Train final model on full dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    X_train_scaled = add_noise(X_train_scaled, noise_factor=0.01)
    y_train_counts = Counter(y_train)
    custom_strategy = {cls: max(count, int(y_train_counts[alert_class] * 1.5)) for cls, count in y_train_counts.items()}
    over_sampler = RandomOverSampler(sampling_strategy=custom_strategy, random_state=SEED)
    X_resampled, y_resampled = over_sampler.fit_resample(X_train_scaled, y_train)

    y_train_cat = to_categorical(y_resampled)
    # Removed unused variable y_test_cat

    model = Sequential([
        Dense(128, activation='relu', input_shape=(X.shape[1],), kernel_regularizer=l2(0.01)),
        BatchNormalization(),
        Dropout(0.4),
        Dense(64, activation='relu', kernel_regularizer=l2(0.01)),
        Dropout(0.3),
        Dense(32, activation='relu', kernel_regularizer=l2(0.01)),
        Dropout(0.2),
        Dense(len(label_encoder.classes_), activation='softmax')
    ])

    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

    model.fit(
        X_resampled, y_train_cat,
        epochs=30,
        batch_size=64,
        validation_split=0.1,
        callbacks=[early_stop],
        verbose=1
    )

    # Final evaluation
    y_pred_probs = model.predict(X_test_scaled)
    y_pred = np.argmax(y_pred_probs, axis=1)

    print("\nFinal Classification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    print("\nFinal Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print(f"\nFinal Accuracy: {accuracy_score(y_test, y_pred):.4f}")

    # Confusion Matrix plot
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix - Neural Network')

    cm_path = os.path.join(models_dir, "nn_confusion_matrix_nodes.png")
    try:
        plt.savefig(cm_path, bbox_inches='tight')
        print(f"Confusion matrix heatmap saved at: {cm_path}")
    except Exception as e:
        print(f"Error saving confusion matrix plot: {e}")
    finally:
        plt.close()

    # Save artifacts
    def safe_joblib_dump(obj, filename):
        filename = os.path.join(models_dir, os.path.basename(filename))
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

    try:
        model.save(os.path.join(models_dir, "neural_net_model_nodes.keras"))
        print(f"Saved neural network model at: {os.path.join(models_dir, 'neural_net_model_nodes.keras')}")
    except Exception as e:
        print(f"Error saving neural network model: {e}")

    safe_joblib_dump(scaler, "scaler_nn_nodes.pkl")
    safe_joblib_dump(label_encoder, "label_encoder_nn_nodes.pkl")
    print("All optimized neural network artifacts saved!")

    return model, scaler, label_encoder

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, 'k8s_node_metrics.csv')
    df = pd.read_csv(data_path)
    print("Data loaded successfully. Shape:", df.shape)
    model, scaler, label_encoder = train_optimized_node_neural_network(df)
