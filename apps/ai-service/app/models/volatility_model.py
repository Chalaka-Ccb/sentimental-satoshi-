from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import numpy as np
import joblib
import os

class VolatilityModel:
    MODEL_PATH = "models/volatility.pkl"

    def __init__(self):
        os.makedirs("models", exist_ok=True)
        if os.path.exists(self.MODEL_PATH):
            self.pipeline = joblib.load(self.MODEL_PATH)
            print(f"[Volatility] Loaded from {self.MODEL_PATH}")
        else:
            self.pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('model', GradientBoostingRegressor(
                    n_estimators=100, learning_rate=0.05,
                    max_depth=3, random_state=42,
                ))
            ])
            print("[Volatility] No saved model — using heuristic fallback until trained")

    def predict(self, features: dict) -> float:
        if not os.path.exists(self.MODEL_PATH):
            return self._heuristic(features)

        X = np.array([[
            features.get('sentiment_score', 0.0),
            np.log1p(features.get('mention_volume', 0)),
            features.get('mention_velocity', 0.0),
            features.get('negative_ratio', 0.5),
            features.get('news_sentiment', 0.0),
            features.get('rsi_14', 50.0) / 100.0,
            features.get('volume_spike', 1.0),
        ]])
        return float(np.clip(self.pipeline.predict(X)[0], 0.0, 1.0))

    def _heuristic(self, features: dict) -> float:
        rsi = features.get('rsi_14', 50.0)
        vol = features.get('mention_volume', 0)
        if rsi > 75 or rsi < 25: return 0.7
        if rsi > 65 or rsi < 35: return 0.4
        if vol > 500: return 0.5
        return 0.2

    def train(self, X: np.ndarray, y: np.ndarray) -> dict:
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
        self.pipeline.fit(X_tr, y_tr)
        mae = mean_absolute_error(y_te, self.pipeline.predict(X_te))
        joblib.dump(self.pipeline, self.MODEL_PATH)
        print(f"[Volatility] Trained — MAE: {mae:.4f}")
        return {"mae": round(mae, 4), "samples": len(X)}