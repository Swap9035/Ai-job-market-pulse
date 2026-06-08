"""
Machine Learning salary prediction service.
Uses scikit-learn Linear Regression trained on the jobs dataset.
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# ─── Module-level cache so model is only trained once ───
_model = None
_encoders = {}
_model_stats = {}


def _get_trained_model():
    """Train model on first call, then cache it in memory."""
    global _model, _encoders, _model_stats
    if _model is not None:
        return _model, _encoders, _model_stats

    df = pd.read_csv(os.path.join(DATA_DIR, 'jobs.csv'))

    # Encode categorical columns
    cat_cols = ['job_title', 'experience_level', 'company_size', 'remote_type', 'location']
    for col in cat_cols:
        le = LabelEncoder()
        df[f'{col}_enc'] = le.fit_transform(df[col])
        _encoders[col] = le

    feature_cols = [f'{c}_enc' for c in cat_cols]
    X = df[feature_cols]
    y = df['salary_inr']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Random Forest is more accurate than Linear Regression for this kind of data
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    _model_stats = {
        "r2_score": round(r2, 4),
        "mae_inr": int(mae),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "algorithm": "Random Forest Regressor",
        "features": cat_cols,
    }

    _model = model
    return _model, _encoders, _model_stats


def predict_salary(job_title: str, experience_level: str, company_size: str,
                   remote_type: str = "Hybrid", location: str = "Bangalore"):
    """
    Predict salary for given inputs.
    Returns predicted salary in INR and USD.
    """
    model, encoders, stats = _get_trained_model()

    try:
        input_data = {}
        cat_cols = ['job_title', 'experience_level', 'company_size', 'remote_type', 'location']
        inputs = {
            'job_title': job_title,
            'experience_level': experience_level,
            'company_size': company_size,
            'remote_type': remote_type,
            'location': location,
        }

        for col in cat_cols:
            le = encoders[col]
            val = inputs[col]
            if val not in le.classes_:
                # Use the closest known class
                val = le.classes_[0]
            input_data[f'{col}_enc'] = le.transform([val])[0]

        X_input = pd.DataFrame([input_data])
        prediction_inr = model.predict(X_input)[0]
        prediction_usd = prediction_inr / 83

        # Confidence range ± 15%
        low = int(prediction_inr * 0.85)
        high = int(prediction_inr * 1.15)

        return {
            "predicted_salary_inr": int(prediction_inr),
            "predicted_salary_usd": int(prediction_usd),
            "range_low_inr": low,
            "range_high_inr": high,
            "inputs": inputs,
            "model_r2": stats['r2_score'],
            "algorithm": stats['algorithm'],
        }
    except Exception as e:
        return {"error": str(e)}


def get_model_info():
    """Return model training statistics"""
    _, _, stats = _get_trained_model()
    return stats


def get_feature_importance():
    """Return which features matter most for salary prediction"""
    model, encoders, _ = _get_trained_model()
    cat_cols = ['job_title', 'experience_level', 'company_size', 'remote_type', 'location']
    importances = model.feature_importances_
    result = [
        {"feature": col, "importance": round(float(imp), 4)}
        for col, imp in zip(cat_cols, importances)
    ]
    return sorted(result, key=lambda x: x['importance'], reverse=True)
