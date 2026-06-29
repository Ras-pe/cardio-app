import warnings
warnings.warn("ml_model (mi_model) API is DEPRECATED. Use New_model/ instead (v2 API on port 8001).", DeprecationWarning)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from predict import predict as ml_predict, FEATURE_DESCRIPTIONS
import uvicorn

app = FastAPI(
    title="CardioApp - ML Prediction API [DEPRECATED]",
    description="API para predicción de riesgo de enfermedad cardíaca (modelo v1 - OBSOLETO, usar New_model/)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HeartData(BaseModel):
    age: float = Field(..., ge=1, le=120, description="Edad en años")
    sex: int = Field(..., ge=0, le=1, description="Sexo (1=masculino, 0=femenino)")
    cp: int = Field(..., ge=0, le=3, description="Tipo de dolor en el pecho (0-3)")
    trestbps: float = Field(..., ge=80, le=250, description="Presión arterial en reposo (mm Hg)")
    chol: float = Field(..., ge=100, le=600, description="Colesterol sérico (mg/dL)")
    fbs: int = Field(..., ge=0, le=1, description="Azúcar en ayunas > 120 mg/dL (1=sí, 0=no)")
    restecg: int = Field(..., ge=0, le=2, description="ECG en reposo (0-2)")
    thalach: float = Field(..., ge=60, le=250, description="Frecuencia cardíaca máxima alcanzada")
    exang: int = Field(..., ge=0, le=1, description="Angina inducida por ejercicio (1=sí, 0=no)")
    oldpeak: float = Field(..., ge=0, le=10, description="Depresión del ST inducida por ejercicio")
    slope: int = Field(..., ge=0, le=2, description="Pendiente del ST (0=ascendente, 1=plana, 2=descendente)")
    ca: int = Field(..., ge=0, le=4, description="Vasos principales coloreados (0-4)")
    thal: int = Field(..., ge=0, le=3, description="Talasemia (0-3)")

    @field_validator('sex', 'fbs', 'exang')
    @classmethod
    def validate_binary(cls, v):
        if v not in (0, 1):
            raise ValueError('Debe ser 0 o 1')
        return v

    @field_validator('cp')
    @classmethod
    def validate_cp(cls, v):
        if v not in (0, 1, 2, 3):
            raise ValueError('cp debe ser 0, 1, 2 o 3')
        return v

    @field_validator('restecg')
    @classmethod
    def validate_restecg(cls, v):
        if v not in (0, 1, 2):
            raise ValueError('restecg debe ser 0, 1 o 2')
        return v

    @field_validator('slope')
    @classmethod
    def validate_slope(cls, v):
        if v not in (0, 1, 2):
            raise ValueError('slope debe ser 0, 1 o 2')
        return v

    @field_validator('ca')
    @classmethod
    def validate_ca(cls, v):
        if v not in (0, 1, 2, 3, 4):
            raise ValueError('ca debe ser 0-4')
        return v

    @field_validator('thal')
    @classmethod
    def validate_thal(cls, v):
        if v not in (0, 1, 2, 3):
            raise ValueError('thal debe ser 0, 1, 2 o 3')
        return v

@app.get("/")
def root():
    return {"message": "CardioApp ML API", "status": "running"}

@app.get("/features")
def get_features():
    return {"features": FEATURE_DESCRIPTIONS}

@app.post("/predict")
def predict_endpoint(data: HeartData):
    try:
        features = data.model_dump()
        result = ml_predict(features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 