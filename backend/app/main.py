"""
StockSage India - Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="StockSage India",
    description="Indian Stock Market Prediction API using ML",
    version="1.0.0"
)

# CORS - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite & React defaults
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routes
from app.routes import market, stock, predict

app.include_router(market.router, prefix="/api/market", tags=["Market"])
app.include_router(stock.router, prefix="/api/stock", tags=["Stock"])
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to StockSage India API 🚀",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy ✅"}
