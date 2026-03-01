"""
Stock Data Service - Fetches Indian stock market data using yfinance
Supports both NSE (.NS) and BSE (.BO) tickers
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional


# Popular Indian Stocks for search & sectors
INDIAN_STOCKS = {
    # IT Sector
    "TCS": {"name": "Tata Consultancy Services", "name_hi": "टाटा कंसल्टेंसी सर्विसेज", "sector": "IT", "nse": "TCS.NS", "bse": "TCS.BO"},
    "INFY": {"name": "Infosys", "name_hi": "इंफोसिस", "sector": "IT", "nse": "INFY.NS", "bse": "INFY.BO"},
    "WIPRO": {"name": "Wipro", "name_hi": "विप्रो", "sector": "IT", "nse": "WIPRO.NS", "bse": "WIPRO.BO"},
    "HCLTECH": {"name": "HCL Technologies", "name_hi": "एचसीएल टेक्नोलॉजीज", "sector": "IT", "nse": "HCLTECH.NS", "bse": "HCLTECH.BO"},
    "TECHM": {"name": "Tech Mahindra", "name_hi": "टेक महिंद्रा", "sector": "IT", "nse": "TECHM.NS", "bse": "TECHM.BO"},

    # Banking Sector
    "HDFCBANK": {"name": "HDFC Bank", "name_hi": "एचडीएफसी बैंक", "sector": "Banking", "nse": "HDFCBANK.NS", "bse": "HDFCBANK.BO"},
    "ICICIBANK": {"name": "ICICI Bank", "name_hi": "आईसीआईसीआई बैंक", "sector": "Banking", "nse": "ICICIBANK.NS", "bse": "ICICIBANK.BO"},
    "SBIN": {"name": "State Bank of India", "name_hi": "भारतीय स्टेट बैंक", "sector": "Banking", "nse": "SBIN.NS", "bse": "SBIN.BO"},
    "KOTAKBANK": {"name": "Kotak Mahindra Bank", "name_hi": "कोटक महिंद्रा बैंक", "sector": "Banking", "nse": "KOTAKBANK.NS", "bse": "KOTAKBANK.BO"},
    "AXISBANK": {"name": "Axis Bank", "name_hi": "एक्सिस बैंक", "sector": "Banking", "nse": "AXISBANK.NS", "bse": "AXISBANK.BO"},

    # Pharma Sector
    "SUNPHARMA": {"name": "Sun Pharmaceutical", "name_hi": "सन फार्मास्यूटिकल", "sector": "Pharma", "nse": "SUNPHARMA.NS", "bse": "SUNPHARMA.BO"},
    "DRREDDY": {"name": "Dr. Reddy's Laboratories", "name_hi": "डॉ. रेड्डीज लेबोरेटरीज", "sector": "Pharma", "nse": "DRREDDY.NS", "bse": "DRREDDY.BO"},
    "CIPLA": {"name": "Cipla", "name_hi": "सिप्ला", "sector": "Pharma", "nse": "CIPLA.NS", "bse": "CIPLA.BO"},
    "DIVISLAB": {"name": "Divi's Laboratories", "name_hi": "डिवीज लैबोरेटरीज", "sector": "Pharma", "nse": "DIVISLAB.NS", "bse": "DIVISLAB.BO"},

    # Auto Sector
    "MARUTI": {"name": "Maruti Suzuki", "name_hi": "मारुति सुजुकी", "sector": "Auto", "nse": "MARUTI.NS", "bse": "MARUTI.BO"},
    "TATAMOTORS": {"name": "Tata Motors", "name_hi": "टाटा मोटर्स", "sector": "Auto", "nse": "TATAMOTORS.NS", "bse": "TATAMOTORS.BO"},
    "EICHERMOT": {"name": "Eicher Motors", "name_hi": "आइशर मोटर्स", "sector": "Auto", "nse": "EICHERMOT.NS", "bse": "EICHERMOT.BO"},
    "BAJAJ-AUTO": {"name": "Bajaj Auto", "name_hi": "बजाज ऑटो", "sector": "Auto", "nse": "BAJAJ-AUTO.NS", "bse": "BAJAJ-AUTO.BO"},
    "M&M": {"name": "Mahindra & Mahindra", "name_hi": "महिंद्रा एंड महिंद्रा", "sector": "Auto", "nse": "M&M.NS", "bse": "M&M.BO"},

    # Energy Sector
    "RELIANCE": {"name": "Reliance Industries", "name_hi": "रिलायंस इंडस्ट्रीज", "sector": "Energy", "nse": "RELIANCE.NS", "bse": "RELIANCE.BO"},
    "ONGC": {"name": "Oil & Natural Gas Corp", "name_hi": "ओएनजीसी", "sector": "Energy", "nse": "ONGC.NS", "bse": "ONGC.BO"},
    "POWERGRID": {"name": "Power Grid Corp", "name_hi": "पावर ग्रिड कॉर्प", "sector": "Energy", "nse": "POWERGRID.NS", "bse": "POWERGRID.BO"},
    "NTPC": {"name": "NTPC Limited", "name_hi": "एनटीपीसी", "sector": "Energy", "nse": "NTPC.NS", "bse": "NTPC.BO"},

    # FMCG Sector
    "HINDUNILVR": {"name": "Hindustan Unilever", "name_hi": "हिंदुस्तान यूनिलीवर", "sector": "FMCG", "nse": "HINDUNILVR.NS", "bse": "HINDUNILVR.BO"},
    "ITC": {"name": "ITC Limited", "name_hi": "आईटीसी", "sector": "FMCG", "nse": "ITC.NS", "bse": "ITC.BO"},
    "NESTLEIND": {"name": "Nestle India", "name_hi": "नेस्ले इंडिया", "sector": "FMCG", "nse": "NESTLEIND.NS", "bse": "NESTLEIND.BO"},
    "BRITANNIA": {"name": "Britannia Industries", "name_hi": "ब्रिटानिया इंडस्ट्रीज", "sector": "FMCG", "nse": "BRITANNIA.NS", "bse": "BRITANNIA.BO"},

    # Metal & Mining
    "TATASTEEL": {"name": "Tata Steel", "name_hi": "टाटा स्टील", "sector": "Metal", "nse": "TATASTEEL.NS", "bse": "TATASTEEL.BO"},
    "HINDALCO": {"name": "Hindalco Industries", "name_hi": "हिंडाल्को इंडस्ट्रीज", "sector": "Metal", "nse": "HINDALCO.NS", "bse": "HINDALCO.BO"},
    "JSWSTEEL": {"name": "JSW Steel", "name_hi": "जेएसडब्ल्यू स्टील", "sector": "Metal", "nse": "JSWSTEEL.NS", "bse": "JSWSTEEL.BO"},
}

# Index tickers
INDICES = {
    "NIFTY50": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "NIFTYIT": "^CNXIT",
}


def get_stock_history(ticker: str, exchange: str = "NSE", period: str = "6mo") -> dict:
    """
    Fetch historical stock data for the given ticker.
    
    Args:
        ticker: Stock symbol (e.g., 'RELIANCE')
        exchange: 'NSE' or 'BSE'
        period: Data period ('1mo', '3mo', '6mo', '1y')
    
    Returns:
        Dictionary with stock data and metadata
    """
    # Build the full ticker symbol
    suffix = ".NS" if exchange.upper() == "NSE" else ".BO"
    full_ticker = f"{ticker}{suffix}"

    try:
        stock = yf.Ticker(full_ticker)
        hist = stock.history(period=period)

        if hist.empty:
            return {"error": f"No data found for {full_ticker}"}

        # Get stock info
        info = stock.info

        # Format data for frontend
        history_data = []
        for date, row in hist.iterrows():
            history_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"]),
            })

        # Current price info
        current_price = round(hist["Close"].iloc[-1], 2)
        prev_close = round(hist["Close"].iloc[-2], 2) if len(hist) > 1 else current_price
        change = round(current_price - prev_close, 2)
        change_percent = round((change / prev_close) * 100, 2) if prev_close != 0 else 0

        # Stock metadata
        stock_info = INDIAN_STOCKS.get(ticker.upper(), {})

        return {
            "ticker": ticker.upper(),
            "exchange": exchange.upper(),
            "full_ticker": full_ticker,
            "name": stock_info.get("name", info.get("longName", ticker)),
            "name_hi": stock_info.get("name_hi", ""),
            "sector": stock_info.get("sector", info.get("sector", "Unknown")),
            "current_price": current_price,
            "previous_close": prev_close,
            "change": change,
            "change_percent": change_percent,
            "currency": "INR",
            "day_high": round(hist["High"].iloc[-1], 2),
            "day_low": round(hist["Low"].iloc[-1], 2),
            "volume": int(hist["Volume"].iloc[-1]),
            "fifty_two_week_high": round(hist["High"].max(), 2),
            "fifty_two_week_low": round(hist["Low"].min(), 2),
            "history": history_data,
        }

    except Exception as e:
        return {"error": str(e)}


def get_index_data(index_name: str) -> dict:
    """Fetch index data (NIFTY 50, SENSEX, etc.)"""
    ticker_symbol = INDICES.get(index_name.upper())
    if not ticker_symbol:
        return {"error": f"Unknown index: {index_name}"}

    try:
        index = yf.Ticker(ticker_symbol)
        hist = index.history(period="5d")

        if hist.empty:
            return {"error": f"No data found for {index_name}"}

        current = round(hist["Close"].iloc[-1], 2)
        prev = round(hist["Close"].iloc[-2], 2) if len(hist) > 1 else current
        change = round(current - prev, 2)
        change_percent = round((change / prev) * 100, 2) if prev != 0 else 0

        return {
            "name": index_name,
            "value": current,
            "change": change,
            "change_percent": change_percent,
        }

    except Exception as e:
        return {"error": str(e)}


def get_market_overview() -> dict:
    """Get overview of all major indices + top gainers/losers"""
    
    # Fetch all indices
    indices_data = []
    for index_name in INDICES:
        data = get_index_data(index_name)
        if "error" not in data:
            indices_data.append(data)

    # Fetch a sample of stocks to find gainers/losers
    stock_changes = []
    sample_stocks = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", 
                     "SBIN", "ITC", "EICHERMOT", "SUNPHARMA", "WIPRO",
                     "AXISBANK", "MARUTI", "TATASTEEL", "NTPC", "HINDUNILVR"]

    for ticker in sample_stocks:
        try:
            full_ticker = f"{ticker}.NS"
            stock = yf.Ticker(full_ticker)
            hist = stock.history(period="5d")
            
            if not hist.empty and len(hist) > 1:
                current = round(hist["Close"].iloc[-1], 2)
                prev = round(hist["Close"].iloc[-2], 2)
                change = round(current - prev, 2)
                change_pct = round((change / prev) * 100, 2) if prev != 0 else 0

                stock_info = INDIAN_STOCKS.get(ticker, {})
                stock_changes.append({
                    "ticker": ticker,
                    "name": stock_info.get("name", ticker),
                    "name_hi": stock_info.get("name_hi", ""),
                    "sector": stock_info.get("sector", "Unknown"),
                    "price": current,
                    "change": change,
                    "change_percent": change_pct,
                })
        except Exception:
            continue

    # Sort to get top gainers and losers
    stock_changes.sort(key=lambda x: x["change_percent"], reverse=True)
    top_gainers = stock_changes[:5]
    top_losers = stock_changes[-5:][::-1]  # Reverse to show worst first

    # Sector-wise grouping
    sectors = {}
    for stock in stock_changes:
        sector = stock["sector"]
        if sector not in sectors:
            sectors[sector] = []
        sectors[sector].append(stock)

    return {
        "indices": indices_data,
        "top_gainers": top_gainers,
        "top_losers": top_losers,
        "sectors": sectors,
    }


def search_stocks(query: str) -> list:
    """Search stocks by ticker or company name"""
    query = query.upper().strip()
    results = []

    for ticker, info in INDIAN_STOCKS.items():
        if (query in ticker.upper() or 
            query in info["name"].upper() or 
            query in info.get("name_hi", "")):
            results.append({
                "ticker": ticker,
                "name": info["name"],
                "name_hi": info["name_hi"],
                "sector": info["sector"],
                "nse": info["nse"],
                "bse": info["bse"],
            })

    return results[:10]  # Return max 10 results
