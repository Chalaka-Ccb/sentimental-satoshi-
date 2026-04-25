from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List
import math

from ..services.conviction import calculate_conviction_score

router = APIRouter()

class AnalysisRequest(BaseModel):
    symbol: str
    texts: List[str]
    engagements: List[float] | None = None
    rsi: float = 50.0
    mention_volume: int = 0

@router.post("/conviction")
def full_conviction(req: AnalysisRequest, request: Request):
    models = request.app.state.models
    sentiment_model = models['sentiment']
    ner_model = models['ner']
    volatility_model = models['volatility']

    # Step 1: Sentiment
    weights = [math.log1p(e) for e in req.engagements] if req.engagements else None
    analyses = sentiment_model.analyze(req.texts)
    aggregate = sentiment_model.aggregate(analyses, weights)

    # Step 2: Coin extraction
    coin_mentions = ner_model.extract_batch(req.texts)
    mentioned_symbols = list(set(c for coins in coin_mentions for c in coins))

    # Step 3: Volatility
    neg_count = sum(1 for a in analyses if a['polarity'] < 0)
    neg_ratio = neg_count / len(analyses) if analyses else 0.5

    vol_features = {
        'sentiment_score': aggregate['rawScore'],
        'mention_volume': req.mention_volume,
        'mention_velocity': 1.0,
        'negative_ratio': neg_ratio,
        'rsi_14': req.rsi,
    }
    volatility = volatility_model.predict(vol_features)

    # Step 4: Conviction score
    conviction = calculate_conviction_score(
        sentiment_score=aggregate['rawScore'],
        sentiment_conviction=aggregate['conviction'],
        volatility=volatility,
        mention_volume=req.mention_volume,
        rsi=req.rsi,
    )

    return {
        "symbol": req.symbol.upper(),
        "sentiment": aggregate,
        "conviction": conviction,
        "volatilityPrediction": round(volatility, 3),
        "mentionedSymbols": mentioned_symbols,
        "sampleCount": len(req.texts),
    }