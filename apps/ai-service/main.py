from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv('../../../.env')   # Load from monorepo root .env  || Do not keep the folder level .env!

from app.models.sentiment_model import SentimentModel
from app.models.ner_model import NERModel
from app.models.volatility_model import VolatilityModel
from app.routes import sentiment, analysis

models: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading AI models (this takes 30-60s on first run)...")
    models['sentiment'] = SentimentModel()
    models['ner'] = NERModel()
    models['volatility'] = VolatilityModel()
    print("All models ready.")
    yield
    models.clear()

app = FastAPI(title="Sentimental Satoshi — AI Service", version="1.0.0", lifespan=lifespan)
app.state.models = models

app.include_router(sentiment.router, prefix="/ai/sentiment")
# app.include_router(ner.router, prefix="/ai/ner")
app.include_router(analysis.router, prefix="/ai/analysis")

@app.get("/health")
def health():
    return {"status": "ok", "models": list(models.keys())}