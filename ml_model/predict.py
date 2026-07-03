import numpy as np
import pandas as pd
import joblib
import os
from typing import Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

pipeline = joblib.load(os.path.join(BASE_DIR, 'heart_model_v2.pkl'))
all_features = joblib.load(os.path.join(BASE_DIR, 'all_features.pkl'))

FEATURE_DESCRIPTIONS = {
    'age': 'Edad (años)',
    'sex': 'Sexo (M=masculino, F=femenino)',
    'chestPainType': 'Tipo de dolor en el pecho (ATA=angina típica, NAP=angina atípica, ASY=asintomático, TA=dolor no anginal)',
    'restingBP': 'Presión arterial en reposo (mm Hg)',
    'cholesterol': 'Colesterol sérico (mg/dL)',
    'fastingBS': 'Azúcar en ayunas > 120 mg/dL (1=sí, 0=no)',
    'restingECG': 'ECG en reposo (Normal, ST=anomalía ST-T, LVH=hipertrofia ventricular izquierda)',
    'maxHR': 'Frecuencia cardíaca máxima alcanzada',
    'exerciseAngina': 'Angina inducida por ejercicio (Y=sí, N=no)',
    'oldpeak': 'Depresión del ST inducida por ejercicio',
    'stSlope': 'Pendiente del ST en ejercicio máximo (Up=ascendente, Flat=plana, Down=descendente)',
}

FEATURE_KEY_MAP = {
    'age': 'Age',
    'sex': 'Sex',
    'chestPainType': 'ChestPainType',
    'restingBP': 'RestingBP',
    'cholesterol': 'Cholesterol',
    'fastingBS': 'FastingBS',
    'restingECG': 'RestingECG',
    'maxHR': 'MaxHR',
    'exerciseAngina': 'ExerciseAngina',
    'oldpeak': 'Oldpeak',
    'stSlope': 'ST_Slope',
}

def predict(features: Dict[str, Any]) -> Dict[str, Any]:
    input_dict = {}
    for api_key, csv_key in FEATURE_KEY_MAP.items():
        input_dict[csv_key] = features[api_key]

    input_df = pd.DataFrame([input_dict])
    input_df = input_df[all_features]

    prediction = pipeline.predict(input_df)[0]
    probability = pipeline.predict_proba(input_df)[0]

    return {
        'prediction': int(prediction),
        'label': 'Riesgo de enfermedad cardíaca' if prediction == 1 else 'Sin riesgo significativo',
        'probability_no_risk': round(float(probability[0]) * 100, 2),
        'probability_risk': round(float(probability[1]) * 100, 2),
        'risk_level': 'Alto' if probability[1] >= 0.7 else ('Moderado' if probability[1] >= 0.4 else 'Bajo'),
    }

if __name__ == '__main__':
    sample = {
        'age': 54,
        'sex': 'M',
        'chestPainType': 'NAP',
        'restingBP': 150,
        'cholesterol': 195,
        'fastingBS': 0,
        'restingECG': 'Normal',
        'maxHR': 122,
        'exerciseAngina': 'N',
        'oldpeak': 0.0,
        'stSlope': 'Up',
    }
    result = predict(sample)
    print(f"Predicción: {result}")
