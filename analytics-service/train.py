"""Synthetic training data and model definitions for the risk assessment models.

The project specification allows synthetically generated data where additional
testing data is required. Ground-truth risk labels here are derived from a
weighted combination of the same indicators the platform tracks (attendance,
assessment performance, engagement), with noise added so the classes aren't
perfectly separable — a more realistic target for both models to learn.
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURE_NAMES = [
    "attendanceRate",
    "weightedAssessmentPercentage",
    "vleClicks",
    "loginCount",
    "forumPosts",
    "resourceAccessCount",
]


def generate_synthetic_dataset(n: int = 1200, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    attendance_rate = rng.uniform(0, 100, n)
    assessment_pct = rng.uniform(0, 100, n)
    vle_clicks = rng.uniform(0, 300, n)
    login_count = rng.uniform(0, 30, n)
    forum_posts = rng.uniform(0, 15, n)
    resource_access = rng.uniform(0, 100, n)

    difficulty = (
        -0.05 * (attendance_rate - 70)
        - 0.06 * (assessment_pct - 65)
        - 0.01 * (vle_clicks - 120)
        - 0.05 * (login_count - 10)
        - 0.08 * (forum_posts - 5)
        - 0.01 * (resource_access - 40)
    )
    noise = rng.normal(0, 1.1, n)
    probability = 1 / (1 + np.exp(-(difficulty + noise)))
    at_risk = (probability > 0.5).astype(int)

    return pd.DataFrame(
        {
            "attendanceRate": attendance_rate,
            "weightedAssessmentPercentage": assessment_pct,
            "vleClicks": vle_clicks,
            "loginCount": login_count,
            "forumPosts": forum_posts,
            "resourceAccessCount": resource_access,
            "atRisk": at_risk,
        }
    )


class RiskNet(nn.Module):
    """A basic feed-forward neural network (multi-layer perceptron)."""

    def __init__(self, input_dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 12),
            nn.ReLU(),
            nn.Linear(12, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
        )

    def forward(self, x):
        return self.net(x)


def _classification_metrics(y_true, y_pred) -> dict:
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
    }


def train_models() -> dict:
    df = generate_synthetic_dataset()
    X = df[FEATURE_NAMES].values
    y = df["atRisk"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler().fit(X_train)
    X_train_scaled = scaler.transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    classical_model = LogisticRegression(max_iter=1000)
    classical_model.fit(X_train_scaled, y_train)
    classical_metrics = _classification_metrics(
        y_test, classical_model.predict(X_test_scaled)
    )

    torch.manual_seed(42)
    dl_model = RiskNet(input_dim=X_train_scaled.shape[1])
    optimizer = torch.optim.Adam(dl_model.parameters(), lr=0.01) # Adam optimizer for training the neural network.
    loss_fn = nn.BCEWithLogitsLoss() # Binary Cross-Entropy loss with logits for binary classification.

    X_train_t = torch.tensor(X_train_scaled, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).unsqueeze(1)

    # Fixed 200 epochs, no early stopping
    dl_model.train()
    for _ in range(200):
        optimizer.zero_grad()
        loss = loss_fn(dl_model(X_train_t), y_train_t)
        loss.backward()
        optimizer.step()

    dl_model.eval()
    with torch.no_grad():
        X_test_t = torch.tensor(X_test_scaled, dtype=torch.float32)
        test_probs = torch.sigmoid(dl_model(X_test_t)).numpy().flatten()
    dl_metrics = _classification_metrics(y_test, (test_probs > 0.5).astype(int))

    return {
        "scaler": scaler,
        "classical_model": classical_model,
        "classical_metrics": classical_metrics,
        "dl_model": dl_model,
        "dl_metrics": dl_metrics,
    }
