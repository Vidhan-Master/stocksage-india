"""
Prediction Routes - ML-based stock prediction using Prophet + ARIMA
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class PredictionRequest(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol, e.g., RELIANCE")
    exchange: str = Field("NSE", description="Exchange: NSE or BSE")
    horizon: int = Field(7, description="Prediction horizon in days: 1, 7, or 30")


class PredictionResponse(BaseModel):
    success: bool
    data: dict = None
    error: str = None


@router.post("/", response_model=PredictionResponse)
async def predict_stock(request: PredictionRequest):
    """
    Predict stock price using ML models (Prophet + ARIMA).
    
    - **ticker**: Stock symbol (e.g., RELIANCE, TCS, INFY)
    - **exchange**: NSE or BSE
    - **horizon**: 1 day, 7 days, or 30 days prediction
    
    Returns predicted prices, confidence score, and buy/sell/hold signal.
    """
    # Validate horizon
    if request.horizon not in [1, 7, 30]:
        raise HTTPException(
            status_code=400,
            detail="Horizon must be 1, 7, or 30 days"
        )
    
    try:
        from app.models.predictor import run_prediction
        
        result = run_prediction(
            ticker=request.ticker.upper(),
            exchange=request.exchange.upper(),
            horizon=request.horizon,
        )
        
        return PredictionResponse(success=True, data=result)
    
    except ValueError as e:
        return PredictionResponse(success=False, error=str(e))
    except Exception as e:
        return PredictionResponse(success=False, error=f"Prediction failed: {str(e)}")
