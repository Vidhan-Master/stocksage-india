"""
StockSage India - ML Prediction Engine
Uses Facebook Prophet (primary) + ARIMA (secondary) for stock price prediction
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional
import warnings
warnings.filterwarnings("ignore")

# Prophet
from prophet import Prophet

# ARIMA
from statsmodels.tsa.arima.model import ARIMA

# Data
import yfinance as yf


def fetch_stock_data(ticker: str, exchange: str = "NSE", period: str = "1y") -> pd.DataFrame:
    """
    Fetch stock data for ML model training.
    Uses 1 year of data for better predictions.
    """
    suffix = ".NS" if exchange.upper() == "NSE" else ".BO"
    full_ticker = f"{ticker}{suffix}"
    
    stock = yf.Ticker(full_ticker)
    hist = stock.history(period=period)
    
    if hist.empty:
        raise ValueError(f"No data found for {full_ticker}")
    
    hist = hist.reset_index()
    hist["Date"] = pd.to_datetime(hist["Date"]).dt.tz_localize(None)
    return hist


def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add technical indicators as features:
    - Moving Averages (SMA 7, 21, 50)
    - RSI (14-day)
    - Volume Moving Average
    - Price Momentum
    """
    df = df.copy()
    
    # Simple Moving Averages
    df["SMA_7"] = df["Close"].rolling(window=7).mean()
    df["SMA_21"] = df["Close"].rolling(window=21).mean()
    df["SMA_50"] = df["Close"].rolling(window=50).mean()
    
    # RSI (Relative Strength Index)
    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))
    
    # Volume Moving Average
    df["Volume_MA"] = df["Volume"].rolling(window=20).mean()
    
    # Price Momentum (rate of change)
    df["Momentum_5"] = df["Close"].pct_change(periods=5) * 100
    df["Momentum_10"] = df["Close"].pct_change(periods=10) * 100
    
    # Volatility (standard deviation of returns)
    df["Volatility"] = df["Close"].pct_change().rolling(window=21).std() * np.sqrt(252) * 100
    
    # MACD
    ema_12 = df["Close"].ewm(span=12).mean()
    ema_26 = df["Close"].ewm(span=26).mean()
    df["MACD"] = ema_12 - ema_26
    df["MACD_Signal"] = df["MACD"].ewm(span=9).mean()
    
    return df


def predict_with_prophet(df: pd.DataFrame, horizon: int) -> dict:
    """
    Predict stock prices using Facebook Prophet.
    
    Args:
        df: DataFrame with Date and Close columns
        horizon: Number of days to predict (1, 7, or 30)
    
    Returns:
        Dictionary with predictions and confidence intervals
    """
    # Prepare data for Prophet (requires 'ds' and 'y' columns)
    prophet_df = pd.DataFrame({
        "ds": df["Date"],
        "y": df["Close"]
    })
    
    # Initialize and fit Prophet model
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True,
        changepoint_prior_scale=0.05,  # Controls flexibility
        interval_width=0.80,  # 80% confidence interval
    )
    
    # Suppress Prophet output
    model.fit(prophet_df)
    
    # Create future dataframe
    future = model.make_future_dataframe(periods=horizon, freq="B")  # B = business days
    
    # Predict
    forecast = model.predict(future)
    
    # Extract predictions for the future period
    future_predictions = forecast.tail(horizon)
    
    predictions = []
    for _, row in future_predictions.iterrows():
        predictions.append({
            "date": row["ds"].strftime("%Y-%m-%d"),
            "predicted_price": round(float(row["yhat"]), 2),
            "lower_bound": round(float(row["yhat_lower"]), 2),
            "upper_bound": round(float(row["yhat_upper"]), 2),
        })
    
    # Historical fitted values (for actual vs predicted chart)
    historical_fit = []
    historical_forecast = forecast.iloc[:-horizon] if horizon > 0 else forecast
    for _, row in historical_forecast.iterrows():
        historical_fit.append({
            "date": row["ds"].strftime("%Y-%m-%d"),
            "predicted_price": round(float(row["yhat"]), 2),
        })
    
    return {
        "model": "Prophet",
        "predictions": predictions,
        "historical_fit": historical_fit[-60:],  # Last 60 days of fitted values
    }


def predict_with_arima(df: pd.DataFrame, horizon: int) -> dict:
    """
    Predict stock prices using ARIMA model.
    
    Args:
        df: DataFrame with Date and Close columns
        horizon: Number of days to predict (1, 7, or 30)
    
    Returns:
        Dictionary with predictions
    """
    # Use closing prices
    close_prices = df["Close"].values
    
    try:
        # Fit ARIMA model (order: p=5, d=1, q=0 — common for stock data)
        model = ARIMA(close_prices, order=(5, 1, 0))
        fitted_model = model.fit()
        
        # Forecast
        forecast = fitted_model.forecast(steps=horizon)
        conf_int = fitted_model.get_forecast(steps=horizon).conf_int(alpha=0.2)  # 80% CI
        
        # Build predictions with dates
        last_date = df["Date"].iloc[-1]
        predictions = []
        
        current_date = last_date
        for i in range(horizon):
            # Skip weekends
            current_date += timedelta(days=1)
            while current_date.weekday() >= 5:  # 5=Saturday, 6=Sunday
                current_date += timedelta(days=1)
            
            predictions.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "predicted_price": round(float(forecast[i]), 2),
                "lower_bound": round(float(conf_int[i][0]), 2),
                "upper_bound": round(float(conf_int[i][1]), 2),
            })
        
        # Historical fitted values
        fitted_values = fitted_model.fittedvalues
        if not isinstance(fitted_values, np.ndarray):
            fitted_values = np.array(fitted_values)
        historical_fit = []
        for i in range(max(0, len(fitted_values) - 60), len(fitted_values)):
            historical_fit.append({
                "date": df["Date"].iloc[i].strftime("%Y-%m-%d"),
                "predicted_price": round(float(fitted_values[i]), 2),
            })
        
        return {
            "model": "ARIMA",
            "predictions": predictions,
            "historical_fit": historical_fit,
        }
    
    except Exception as e:
        return {
            "model": "ARIMA",
            "error": str(e),
            "predictions": [],
            "historical_fit": [],
        }


def calculate_confidence_score(prophet_preds: list, arima_preds: list) -> float:
    """
    Calculate confidence score based on agreement between Prophet and ARIMA.
    Higher agreement = higher confidence.
    """
    if not prophet_preds or not arima_preds:
        return 50.0
    
    # Compare the final predicted prices
    min_len = min(len(prophet_preds), len(arima_preds))
    
    total_diff_pct = 0
    for i in range(min_len):
        p_price = prophet_preds[i]["predicted_price"]
        a_price = arima_preds[i]["predicted_price"]
        avg_price = (p_price + a_price) / 2
        
        if avg_price > 0:
            diff_pct = abs(p_price - a_price) / avg_price * 100
            total_diff_pct += diff_pct
    
    avg_diff = total_diff_pct / min_len if min_len > 0 else 0
    
    # Convert difference to confidence (less difference = more confidence)
    # 0% diff -> 95% confidence, 10% diff -> 45% confidence
    confidence = max(30, min(95, 95 - (avg_diff * 5)))
    
    return round(confidence, 1)


def run_prediction(ticker: str, exchange: str = "NSE", horizon: int = 7) -> dict:
    """
    Main prediction function - runs both models and combines results.
    
    Args:
        ticker: Stock symbol (e.g., 'RELIANCE')
        exchange: 'NSE' or 'BSE'
        horizon: Prediction days (1, 7, or 30)
    
    Returns:
        Complete prediction result with both models
    """
    # Validate horizon
    if horizon not in [1, 7, 30]:
        horizon = 7
    
    # Step 1: Fetch data (1 year for training)
    df = fetch_stock_data(ticker, exchange, period="1y")
    
    # Step 2: Add technical indicators (for feature context)
    df_with_indicators = add_technical_indicators(df)
    
    # Step 3: Run Prophet prediction
    prophet_result = predict_with_prophet(df, horizon)
    
    # Step 4: Run ARIMA prediction
    arima_result = predict_with_arima(df, horizon)
    
    # Step 5: Calculate confidence score
    confidence = calculate_confidence_score(
        prophet_result.get("predictions", []),
        arima_result.get("predictions", [])
    )
    
    # Step 6: Create combined/ensemble prediction (average of both models)
    ensemble_predictions = []
    prophet_preds = prophet_result.get("predictions", [])
    arima_preds = arima_result.get("predictions", [])
    min_len = min(len(prophet_preds), len(arima_preds))
    
    for i in range(min_len):
        p = prophet_preds[i]
        a = arima_preds[i]
        ensemble_predictions.append({
            "date": p["date"],
            "predicted_price": round((p["predicted_price"] + a["predicted_price"]) / 2, 2),
            "lower_bound": round(min(p["lower_bound"], a["lower_bound"]), 2),
            "upper_bound": round(max(p["upper_bound"], a["upper_bound"]), 2),
            "prophet_price": p["predicted_price"],
            "arima_price": a["predicted_price"],
        })
    
    # Step 7: Get current stock info
    current_price = round(float(df["Close"].iloc[-1]), 2)
    last_date = df["Date"].iloc[-1].strftime("%Y-%m-%d")
    
    # Final predicted price (last day of horizon)
    final_prediction = ensemble_predictions[-1]["predicted_price"] if ensemble_predictions else current_price
    predicted_change = round(final_prediction - current_price, 2)
    predicted_change_pct = round((predicted_change / current_price) * 100, 2) if current_price > 0 else 0
    
    # Technical indicators snapshot
    latest_indicators = {}
    if not df_with_indicators.empty:
        last_row = df_with_indicators.iloc[-1]
        latest_indicators = {
            "sma_7": round(float(last_row.get("SMA_7", 0)), 2) if pd.notna(last_row.get("SMA_7")) else None,
            "sma_21": round(float(last_row.get("SMA_21", 0)), 2) if pd.notna(last_row.get("SMA_21")) else None,
            "sma_50": round(float(last_row.get("SMA_50", 0)), 2) if pd.notna(last_row.get("SMA_50")) else None,
            "rsi": round(float(last_row.get("RSI", 50)), 2) if pd.notna(last_row.get("RSI")) else 50.0,
            "macd": round(float(last_row.get("MACD", 0)), 2) if pd.notna(last_row.get("MACD")) else None,
            "volatility": round(float(last_row.get("Volatility", 0)), 2) if pd.notna(last_row.get("Volatility")) else None,
        }
    
    # Determine signal (Buy/Sell/Hold)
    signal = "HOLD"
    if predicted_change_pct > 2:
        signal = "BUY"
    elif predicted_change_pct < -2:
        signal = "SELL"
    
    # Actual historical prices (for actual vs predicted chart)
    actual_history = []
    for _, row in df.tail(60).iterrows():
        actual_history.append({
            "date": row["Date"].strftime("%Y-%m-%d"),
            "price": round(float(row["Close"]), 2),
        })
    
    return {
        "ticker": ticker.upper(),
        "exchange": exchange.upper(),
        "horizon": horizon,
        "current_price": current_price,
        "last_data_date": last_date,
        "predicted_price": final_prediction,
        "predicted_change": predicted_change,
        "predicted_change_percent": predicted_change_pct,
        "signal": signal,
        "confidence_score": confidence,
        "ensemble_predictions": ensemble_predictions,
        "prophet": prophet_result,
        "arima": arima_result,
        "technical_indicators": latest_indicators,
        "actual_history": actual_history,
    }
