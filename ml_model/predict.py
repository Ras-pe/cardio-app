import numpy as np
import joblib
import os
from typing import Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, 'heart_model.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, 'heart_scaler.pkl'))
feature_names = joblib.load(os.path.join(BASE_DIR, 'feature_names.pkl'))

FEATURE_DESCRIPTIONS = {
    'age': 'Edad (años)',
    'sex': 'Sexo (1=masculino, 0=femenino)',
    'cp': 'Tipo de dolor en el pecho (0=asintomático, 1=angina atípica, 2=dolor no anginal, 3=angina típica)',
    'trestbps': 'Presión arterial en reposo (mm Hg)',
    'chol': 'Colesterol sérico (mg/dL)',
    'fbs': 'Azúcar en ayunas > 120 mg/dL (1=sí, 0=no)',
    'restecg': 'ECG en reposo (0=normal, 1=anomalía ST-T, 2=hipertrofia ventricular izquierda)',
    'thalach': 'Frecuencia cardíaca máxima alcanzada',
    'exang': 'Angina inducida por ejercicio (1=sí, 0=no)',
    'oldpeak': 'Depresión del ST inducida por ejercicio',
    'slope': 'Pendiente del ST en ejercicio máximo (0=ascendente, 1=plana, 2=descendente)',
    'ca': 'Vasos principales coloreados (0-4)',
    'thal': 'Talasemia (0=normal, 1=defecto fijo, 2=defecto reversible)',
}

def predict(features: Dict[str, float]) -> Dict[str, Any]:
    input_array = np.array([[features[name] for name in feature_names]])
    input_scaled = scaler.transform(input_array)

    prediction = model.predict(input_scaled)[0]
    probability = model.predict_proba(input_scaled)[0]

    result = {
        'prediction': int(prediction),
        'label': 'Riesgo de enfermedad cardíaca' if prediction == 1 else 'Sin riesgo significativo',
        'probability_no_risk': round(float(probability[0]) * 100, 2),
        'probability_risk': round(float(probability[1]) * 100, 2),
        'risk_level': 'Alto' if probability[1] >= 0.7 else ('Moderado' if probability[1] >= 0.4 else 'Bajo'),
    }

    return result

if __name__ == '__main__':
    sample = {
        'age': 58,
        'sex': 1,
        'cp': 0,
        'trestbps': 120,
        'chol': 240,
        'fbs': 0,
        'restecg': 1,
        'thalach': 150,
        'exang': 0,
        'oldpeak': 0.8,
        'slope': 2,
        'ca': 0,
        'thal': 2,
    }
    result = predict(sample)
    print(f"Predicción: {result}")
