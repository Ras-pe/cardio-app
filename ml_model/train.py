import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

df = pd.read_csv(os.path.join(PROJECT_DIR, 'heart-disease.csv'))

print("Columnas del dataset:", list(df.columns))
print(f"Shape: {df.shape}")
print(f"Distribución target:\n{df['target'].value_counts()}")
print(f"Valores nulos:\n{df.isnull().sum()}")

X = df.drop('target', axis=1)
y = df['target']

feature_names = list(X.columns)
print(f"\nCaracterísticas ({len(feature_names)}): {feature_names}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    class_weight='balanced'
)

model.fit(X_train_scaled, y_train)

train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
test_acc = accuracy_score(y_test, model.predict(X_test_scaled))
print(f"\nTrain Accuracy: {train_acc:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
print(f"Cross-validation scores: {cv_scores}")
print(f"CV mean: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

y_pred = model.predict(X_test_scaled)
print(f"\nClassification Report (Test):\n{classification_report(y_test, y_pred)}")
print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

importances = model.feature_importances_
indices = np.argsort(importances)[::-1]
print("\nFeature Importances:")
for i in range(len(feature_names)):
    print(f"  {i+1}. {feature_names[indices[i]]}: {importances[indices[i]]:.4f}")

os.makedirs(BASE_DIR, exist_ok=True)
joblib.dump(model, os.path.join(BASE_DIR, 'heart_model.pkl'))
joblib.dump(scaler, os.path.join(BASE_DIR, 'heart_scaler.pkl'))
joblib.dump(feature_names, os.path.join(BASE_DIR, 'feature_names.pkl'))

print("\nModelo guardado en ml_model/heart_model.pkl")
print("Scaler guardado en ml_model/heart_scaler.pkl")
print("Feature names guardado en ml_model/feature_names.pkl")
