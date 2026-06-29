from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from predict import predict as ml_predict, FEATURE_DESCRIPTIONS
import uvicorn

app = FastAPI(
    title="CardioApp - ML Prediction API v2",
    description="API para predicción de riesgo de enfermedad cardíaca (modelo v2 - Heart Failure dataset)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_SEX = ['M', 'F']
VALID_CHEST_PAIN = ['ATA', 'NAP', 'ASY', 'TA']
VALID_ECG = ['Normal', 'ST', 'LVH']
VALID_ANGINA = ['Y', 'N']
VALID_ST_SLOPE = ['Up', 'Flat', 'Down']

class HeartDataNew(BaseModel):
    age: float = Field(..., ge=1, le=120, description="Edad en años")
    sex: str = Field(..., description="Sexo (M=masculino, F=femenino)")
    chestPainType: str = Field(..., description="Tipo de dolor en el pecho (ATA, NAP, ASY, TA)")
    restingBP: float = Field(..., ge=80, le=250, description="Presión arterial en reposo (mm Hg)")
    cholesterol: float = Field(..., ge=100, le=600, description="Colesterol sérico (mg/dL)")
    fastingBS: int = Field(..., ge=0, le=1, description="Azúcar en ayunas > 120 mg/dL (1=sí, 0=no)")
    restingECG: str = Field(..., description="ECG en reposo (Normal, ST, LVH)")
    maxHR: float = Field(..., ge=60, le=250, description="Frecuencia cardíaca máxima alcanzada")
    exerciseAngina: str = Field(..., description="Angina inducida por ejercicio (Y=sí, N=no)")
    oldpeak: float = Field(..., ge=0, le=10, description="Depresión del ST inducida por ejercicio")
    stSlope: str = Field(..., description="Pendiente del ST (Up, Flat, Down)")

    @field_validator('sex')
    @classmethod
    def validate_sex(cls, v):
        if v not in VALID_SEX:
            raise ValueError(f'Sexo debe ser {", ".join(VALID_SEX)}')
        return v

    @field_validator('chestPainType')
    @classmethod
    def validate_chest_pain(cls, v):
        if v not in VALID_CHEST_PAIN:
            raise ValueError(f'Tipo de dolor debe ser {", ".join(VALID_CHEST_PAIN)}')
        return v

    @field_validator('restingECG')
    @classmethod
    def validate_resting_ecg(cls, v):
        if v not in VALID_ECG:
            raise ValueError(f'ECG debe ser {", ".join(VALID_ECG)}')
        return v

    @field_validator('exerciseAngina')
    @classmethod
    def validate_angina(cls, v):
        if v not in VALID_ANGINA:
            raise ValueError(f'Angina debe ser {", ".join(VALID_ANGINA)}')
        return v

    @field_validator('stSlope')
    @classmethod
    def validate_st_slope(cls, v):
        if v not in VALID_ST_SLOPE:
            raise ValueError(f'Pendiente ST debe ser {", ".join(VALID_ST_SLOPE)}')
        return v

@app.get("/")
def root():
    return {"message": "CardioApp ML API v2", "model": "Heart Failure Prediction", "status": "running"}

@app.get("/features")
def get_features():
    return {"features": FEATURE_DESCRIPTIONS}

@app.post("/predict")
def predict_endpoint(data: HeartDataNew):
    try:
        features = data.model_dump()
        result = ml_predict(features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
