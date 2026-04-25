from transformers import pipeline
import torch
import statistics
from typing import List, Dict

class SentimentModel:
    def __init__(self):
        device = 0 if torch.cuda.is_available() else -1
        model_name = "ElKulako/cryptobert"

        self.pipe = pipeline(
            "text-classification",
            model=model_name,
            tokenizer=model_name,
            device=device,
            batch_size=32,
        )
        print(f"[Sentiment] Loaded {model_name} on {'GPU' if device == 0 else 'CPU'}")

    def analyze(self, texts: List[str]) -> List[Dict]:
        if not texts:
            return []

        # Truncate to transformer max token length
        cleaned = [t[:500] for t in texts if t and t.strip()]
        results = self.pipe(cleaned)

        return [
            {
                "label": r["label"],
                "score": round(r["score"], 4),
                "polarity": self._polarity(r["label"], r["score"]),
            }
            for r in results
        ]

    def _polarity(self, label: str, score: float) -> float:
        label = label.lower()
        if "bullish" in label or "positive" in label:
            return round(score, 4)
        elif "bearish" in label or "negative" in label:
            return round(-score, 4)
        return 0.0

    def aggregate(self, analyses: List[Dict], weights: List[float] = None) -> Dict:
        """
        Takes a list of per-post analyses and produces a single conviction score.
        Weights let you up-rank high-engagement posts.
        """
        if not analyses:
            return {"conviction": 0.0, "sentiment": "neutral", "rawScore": 0.0, "sampleCount": 0}

        if weights is None:
            weights = [1.0] * len(analyses)

        total_weight = sum(weights)
        polarities = [a["polarity"] for a in analyses]
        weighted_avg = sum(p * w for p, w in zip(polarities, weights)) / total_weight

        # Conviction = how strongly sources AGREE (low variance = high conviction)
        if len(polarities) > 1:
            variance = statistics.variance(polarities)
            conviction = round(max(0.0, 1.0 - (variance * 2)), 4)
        else:
            conviction = round(abs(weighted_avg), 4)

        sentiment = "bullish" if weighted_avg > 0.1 else \
                    "bearish" if weighted_avg < -0.1 else "neutral"

        return {
            "conviction": conviction,
            "sentiment": sentiment,
            "rawScore": round(weighted_avg, 4),
            "sampleCount": len(analyses),
        }
