import math

def calculate_conviction_score(
    sentiment_score: float,      # -1.0 to +1.0
    sentiment_conviction: float, # 0.0 to 1.0
    volatility: float,           # 0.0 to 1.0
    mention_volume: int,
    rsi: float = 50.0,
) -> dict:
    """
    Conviction Score: 0–100
    Higher = stronger signal to act on
    """
    # Sentiment signal strength (40%)
    sentiment_component = abs(sentiment_score) * sentiment_conviction * 40

    # Source agreement (25%)
    agreement_component = sentiment_conviction * 25

    # Mention volume — log-normalized, capped at 1000 mentions (20%)
    vol_score = min(1.0, math.log1p(mention_volume) / math.log1p(1000))
    volume_component = vol_score * 20

    # RSI alignment with sentiment direction (15%)
    direction = 1 if sentiment_score > 0 else -1
    rsi_signal = (rsi - 50) / 50    # -1.0 to +1.0
    tech_alignment = max(0.0, direction * rsi_signal)
    tech_component = tech_alignment * 15

    raw = sentiment_component + agreement_component + volume_component + tech_component

    # Dampen score when high volatility predicted (uncertainty = lower conviction)
    final = raw * (1.0 - volatility * 0.3)

    return {
        "convictionScore": round(min(100.0, max(0.0, final)), 1),
        "direction": "bullish" if sentiment_score > 0.05 else
                     "bearish" if sentiment_score < -0.05 else "neutral",
        "components": {
            "sentiment": round(sentiment_component, 1),
            "agreement": round(agreement_component, 1),
            "volume": round(volume_component, 1),
            "technical": round(tech_component, 1),
        },
    }