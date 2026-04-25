from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List
import math

router = APIRouter()

class BatchRequest(BaseModel):
    texts: List[str]
    weights: List[float] | None = None

@router.post("/batch")
def batch_sentiment(req: BatchRequest, request: Request):
    model = request.app.state.models['sentiment']

    analyses = model.analyze(req.texts)

    # Default weights: log(1 + engagement) — but caller can provide custom weights
    weights = req.weights or [1.0] * len(analyses)

    aggregate = model.aggregate(analyses, weights)

    return {
        "individual": analyses,
        "aggregate": aggregate,
    }