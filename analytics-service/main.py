from contextlib import asynccontextmanager

import numpy as np
import torch
from fastapi import FastAPI
from pydantic import BaseModel

from train import FEATURE_NAMES, train_models

MODEL_VERSION = "v1-synthetic"

state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Training classical and deep learning risk models on synthetic data...")
    state.update(train_models())
    print("Classical (logistic regression) metrics:", state["classical_metrics"])
    print("Deep learning (feed-forward NN) metrics:", state["dl_metrics"])
    yield


app = FastAPI(title="Student Success Analytics Service", lifespan=lifespan)


class StudentFeatures(BaseModel):
    studentId: str
    attendanceRate: float
    weightedAssessmentPercentage: float
    vleClicks: float
    loginCount: float
    forumPosts: float
    resourceAccessCount: float


def to_vector(features: StudentFeatures) -> np.ndarray:
    return np.array([[getattr(features, name) for name in FEATURE_NAMES]])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    return {
        "classical": state["classical_metrics"],
        "deepLearning": state["dl_metrics"],
    }


@app.post("/predict/classical")
def predict_classical(features: StudentFeatures):
    scaled = state["scaler"].transform(to_vector(features))
    risk_score = float(state["classical_model"].predict_proba(scaled)[0][1])
    coefficients = state["classical_model"].coef_[0]
    contributing_factors = {
        name: round(float(coef) * float(scaled[0][i]), 4)
        for i, (name, coef) in enumerate(zip(FEATURE_NAMES, coefficients))
    }
    return {
        "riskScore": round(risk_score, 4),
        "modelVersion": f"classical-logistic-regression-{MODEL_VERSION}",
        "contributingFactors": contributing_factors,
    }


@app.post("/predict/deep-learning")
def predict_deep_learning(features: StudentFeatures):
    scaled = state["scaler"].transform(to_vector(features))
    with torch.no_grad():
        logits = state["dl_model"](torch.tensor(scaled, dtype=torch.float32))
        risk_score = float(torch.sigmoid(logits).item())
    return {
        "riskScore": round(risk_score, 4),
        "modelVersion": f"deep-learning-feedforward-{MODEL_VERSION}",
    }
