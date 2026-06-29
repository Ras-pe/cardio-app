from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from predict import predict as ml_predict, FEATURE_DESCRIPTIONS
import uvicorn
import os
import httpx
import json

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

class RecommendationRequest(BaseModel):
    riskLevel: str = Field(..., description="Nivel de riesgo: low, moderate, critical")
    riskScore: float = Field(..., ge=0, le=100, description="Score de riesgo porcentual")
    detectedRhythm: str = Field(..., description="Ritmo cardíaco detectado")
    troponinI: float = Field(..., ge=0, description="Nivel de Troponina I (ng/mL)")
    confidence: float = Field(..., ge=0, le=100, description="Confianza del modelo ML")

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

@app.post("/api/recommendation")
async def get_recommendation(data: RecommendationRequest):
    ollama_model = os.getenv("OLLAMA_MODEL")
    if not ollama_model:
        raise HTTPException(
            status_code=400,
            detail="Modelo LLM no configurado. Define OLLAMA_MODEL en variables de entorno."
        )

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.get("http://localhost:11434/api/tags")
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Servicio LLM no disponible. Verifica que Ollama esté corriendo."
        )

    obsidian_key = os.getenv("OBSIDIAN_API_KEY", "")
    clinical_context = ""
    source_is_vault = False

    if obsidian_key:
        try:
            query = f"{data.detectedRhythm} {data.riskLevel} troponina {data.troponinI}"
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    f"http://localhost:27123/search/simple/?query={query}&contextLength=500",
                    headers={"Authorization": f"Bearer {obsidian_key}"}
                )
                if resp.status_code == 200:
                    results = resp.json()
                    contents = [r.get("content", "") for r in results[:3]]
                    clinical_context = "\n---\n".join(contents)
                    source_is_vault = bool(clinical_context.strip())
        except Exception:
            pass

    prompt = f"""Eres un asistente clínico especializado en cardiología.
Recibes el resultado de un modelo ML de diagnóstico cardíaco
y fragmentos de guías clínicas recuperados de una base de conocimiento.
Usa esos fragmentos como fundamento principal de tu recomendación.
Si los fragmentos no son suficientes, complementa con guías ACC/AHA y ESC.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional:
{{
  "recommendation": string,
  "urgency": "inmediata" | "en pocas horas" | "ambulatoria",
  "clinicalBasis": string,
  "keyAction": string
}}

Resultado del modelo ML:
- Nivel de riesgo: {data.riskLevel}
- Score: {data.riskScore}%
- Ritmo detectado: {data.detectedRhythm}
- Troponina I: {data.troponinI} ng/mL
- Confianza del modelo: {data.confidence}%

Fragmentos clínicos del vault de Obsidian:
{clinical_context}

Genera la recomendación clínica."""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            ollama_resp = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            if ollama_resp.status_code != 200:
                raise HTTPException(status_code=502, detail="Error en la respuesta del LLM.")

            raw = ollama_resp.json().get("response", "")
            raw = raw.strip()
            if raw.startswith("```"):
                lines = raw.split("\n", 1)
                if len(lines) > 1:
                    raw = lines[1]
                if "```" in raw:
                    raw = raw.rsplit("```", 1)[0]
            raw = raw.strip()

            result = json.loads(raw)
            result["sourceIsVault"] = source_is_vault
            return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error al procesar la respuesta del LLM.")
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Error en la respuesta del LLM.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
