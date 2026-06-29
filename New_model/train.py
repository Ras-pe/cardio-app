import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

df = pd.read_csv(os.path.join(BASE_DIR, 'heart.csv'))

print("Columnas del dataset:", list(df.columns))
print(f"Shape: {df.shape}")
print(f"Distribución target:\n{df['HeartDisease'].value_counts()}")
print(f"Valores nulos:\n{df.isnull().sum()}")

X = df.drop('HeartDisease', axis=1)
y = df['HeartDisease']

categorical_features = ['Sex', 'ChestPainType', 'RestingECG', 'ExerciseAngina', 'ST_Slope']
numerical_features = ['Age', 'RestingBP', 'Cholesterol', 'FastingBS', 'MaxHR', 'Oldpeak']

print(f"\nCaracterísticas categóricas ({len(categorical_features)}): {categorical_features}")
print(f"Características numéricas ({len(numerical_features)}): {numerical_features}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features)
    ]
)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    class_weight='balanced'
)

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', model)
])

pipeline.fit(X_train, y_train)

train_acc = accuracy_score(y_train, pipeline.predict(X_train))
test_acc = accuracy_score(y_test, pipeline.predict(X_test))
print(f"\nTrain Accuracy: {train_acc:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5)
print(f"Cross-validation scores: {cv_scores}")
print(f"CV mean: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

y_pred = pipeline.predict(X_test)
print(f"\nClassification Report (Test):\n{classification_report(y_test, y_pred)}")
print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

os.makedirs(BASE_DIR, exist_ok=True)
joblib.dump(pipeline, os.path.join(BASE_DIR, 'heart_model_v2.pkl'))
joblib.dump(list(X.columns), os.path.join(BASE_DIR, 'all_features.pkl'))
joblib.dump(categorical_features, os.path.join(BASE_DIR, 'categorical_features.pkl'))
joblib.dump(numerical_features, os.path.join(BASE_DIR, 'numerical_features.pkl'))

print("\nModelo guardado en New_model/heart_model_v2.pkl")
print("Feature names guardado en New_model/all_features.pkl")
print("Categorical features guardado en New_model/categorical_features.pkl")
print("Numerical features guardado en New_model/numerical_features.pkl")
