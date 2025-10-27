"""
Script to check what labels are in the label encoder
"""
import joblib

# Load label encoder
label_encoder = joblib.load('ml_models/label_encoder.pkl')

print("=" * 50)
print("Label Encoder Information")
print("=" * 50)
print(f"\nTotal number of classes: {len(label_encoder.classes_)}")
print("\nLabel ID -> Label Name mapping:")
print("-" * 50)

for idx, label_name in enumerate(label_encoder.classes_):
    print(f"ID {idx}: {label_name}")

print("\n" + "=" * 50)

