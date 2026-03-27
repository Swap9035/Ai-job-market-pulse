# ============================================================
# services/predictions.py — ML Prediction Service
# ============================================================
# Purpose : Loads trained scikit-learn models and generates
#           skill demand predictions for the API
#
# How it works:
#   1. Load saved models from .pkl file (trained in notebook)
#   2. Load saved predictions from .json file
#   3. Expose functions that Flask routes can call
#
# Why save models instead of retraining each request?
#   Training takes seconds. We only train once (offline).
#   Prediction (inference) takes milliseconds.
#   This is how production ML systems work.
# ============================================================

import joblib
import json
import numpy as np
import os

# Paths to saved model files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_PATH = os.path.join(BASE_DIR, 'models', 'skill_models.pkl')
PREDICTIONS_PATH = os.path.join(BASE_DIR, 'models', 'predictions.json')


# ────────────────────────────────────────────────────────────
# Load saved models and predictions
# ────────────────────────────────────────────────────────────
def load_models():
    """
    Loads trained scikit-learn models from disk.
    Returns dict of {skill_name: LinearRegression model}
    """
    try:
        if os.path.exists(MODELS_PATH):
            models = joblib.load(MODELS_PATH)
            print(f"✅ Loaded {len(models)} ML models")
            return models
        else:
            print("⚠️ No models found. Run the training notebook first.")
            return {}
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return {}


def load_predictions():
    """
    Loads pre-computed predictions from JSON file.
    Faster than running model.predict() on each request.
    """
    try:
        if os.path.exists(PREDICTIONS_PATH):
            with open(PREDICTIONS_PATH, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"❌ Error loading predictions: {e}")
        return {}


# ────────────────────────────────────────────────────────────
# PREDICTION 1: Get all skill predictions
# ────────────────────────────────────────────────────────────
def get_all_predictions():
    """
    Returns predictions for all trained skills.
    Sorted by growth rate — fastest growing skills first.
    """
    predictions = load_predictions()

    if not predictions:
        return []

    # Convert to list and sort by growth rate
    pred_list = list(predictions.values())
    pred_list.sort(key=lambda x: x.get('growth_rate', 0), reverse=True)

    return pred_list


# ────────────────────────────────────────────────────────────
# PREDICTION 2: Get rising skills only
# ────────────────────────────────────────────────────────────
def get_rising_skills():
    """
    Returns only skills with positive growth trend.
    These are the skills worth learning next.
    """
    predictions = load_predictions()
    rising = [
        p for p in predictions.values()
        if p.get('trend') == 'rising'
    ]
    rising.sort(key=lambda x: x.get('growth_rate', 0), reverse=True)
    return rising


# ────────────────────────────────────────────────────────────
# PREDICTION 3: Real-time prediction for a specific skill
# ────────────────────────────────────────────────────────────
def predict_skill(skill_name, year=2024):
    """
    Uses the trained model to predict demand for a
    specific skill in a specific year.

    This is the actual model.predict() call —
    the core of the ML pipeline.
    """
    models = load_models()

    if skill_name not in models:
        return {
            "error": f"No model trained for skill: {skill_name}",
            "available_skills": list(models.keys())
        }

    model = models[skill_name]

    # Predict for requested year
    X = np.array([[year]])
    prediction = model.predict(X)[0]
    prediction = max(0, prediction)  # no negative values

    # Get model details
    # coef_ = slope of the line (positive = growing demand)
    # intercept_ = y-intercept
    slope = model.coef_[0]
    trend = 'rising' if slope > 0.5 else 'falling' if slope < -0.5 else 'stable'

    return {
        "skill": skill_name,
        "year": year,
        "predicted_job_count": round(float(prediction), 1),
        "trend": trend,
        "slope": round(float(slope), 3),
        "interpretation": f"Demand is {trend} at {abs(round(slope, 1))} jobs/year"
    }


# ────────────────────────────────────────────────────────────
# PREDICTION 4: Predict best skills to learn for a role
# ────────────────────────────────────────────────────────────
def get_best_skills_to_learn(target_year=2025):
    """
    Returns skills ranked by predicted future demand.
    Helps users decide WHICH skills to prioritize learning.
    """
    predictions = load_predictions()

    if not predictions:
        return []

    ranked = []
    for skill, pred in predictions.items():
        ranked.append({
            "skill": skill,
            "current_demand": max(pred.get('historical', {0: 0}).values()),
            "predicted_demand": pred.get(f'predicted_{target_year}', 0),
            "growth_rate": pred.get('growth_rate', 0),
            "trend": pred.get('trend', 'stable'),
            "priority": (
                "HIGH" if pred.get('growth_rate', 0) > 10
                else "MEDIUM" if pred.get('growth_rate', 0) > 0
                else "LOW"
            )
        })

    # Sort: high priority first, then by growth rate
    ranked.sort(
        key=lambda x: (
            0 if x['priority'] == 'HIGH'
            else 1 if x['priority'] == 'MEDIUM'
            else 2,
            -x['growth_rate']
        )
    )

    return ranked