import pickle
import joblib

def try_load(file):
    try:
        if file.endswith('.pkl'):
            with open(file, 'rb') as f:
                return pickle.load(f)
        return None
    except Exception as e:
        print(f"Error loading {file}: {str(e)}")
        return None

print("Testing random_forest_model.pkl...")
model = try_load('random_forest_model.pkl') or joblib.load('../models/random_forest_model.pkl')
print("Model type:", type(model))

print("\nTesting scaler.pkl...")
scaler = try_load('scaler.pkl') or joblib.load('../models/scaler.pkl')
print("Scaler type:", type(scaler))

print("\nTesting label_encoder.pkl...")
encoder = try_load('label_encoder.pkl') or joblib.load('../models/label_encoder.pkl')
print("Encoder type:", type(encoder))
