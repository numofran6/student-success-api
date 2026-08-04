# Student Success Analytics Service

Python service exposing the platform's two risk assessment models, matching the
project spec's model development plan: a classical machine learning model
(logistic regression) and a lightweight deep learning model (a small
feed-forward neural network, built with PyTorch), trained on the same
feature set for direct comparison.

Both models are trained on synthetically generated data at startup (the
spec allows synthetic data where additional testing data is required) —
ground-truth risk labels come from a weighted combination of attendance,
assessment, and engagement indicators with added noise, so the classes
aren't trivially separable.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

From the repo root, `npm run install:analytics` and `npm run dev:analytics`
do the same thing without activating the venv manually.

## Endpoints

- `GET /health` — liveness check
- `GET /metrics` — accuracy/precision/recall/F1 for both models on a held-out
  synthetic test split (computed once, at startup)
- `POST /predict/classical` — logistic regression risk score
- `POST /predict/deep-learning` — feed-forward neural network risk score

Both prediction endpoints accept the same body:

```json
{
  "studentId": "uuid",
  "attendanceRate": 72.5,
  "weightedAssessmentPercentage": 61.0,
  "vleClicks": 140,
  "loginCount": 12,
  "forumPosts": 3,
  "resourceAccessCount": 45
}
```

and return:

```json
{
  "riskScore": 0.42,
  "modelVersion": "classical-logistic-regression-v1-synthetic",
  "contributingFactors": { "attendanceRate": 0.12, "...": "..." }
}
```

`contributingFactors` is only returned by the classical model (its logistic
regression coefficients make per-feature contribution straightforward to
compute); the backend's `ModelPrediction` type treats it as optional.
