"""
Stock Routes - Individual stock data, search, history
"""

from fastapi import APIRouter, Query

from app.services.stock_service import get_stock_history, search_stocks

router = APIRouter()


@router.get("/search")
async def stock_search(q: str = Query(..., min_length=1, description="Search query")):
    """
    Search stocks by ticker or company name.
    Example: /api/stock/search?q=reliance
    """
    results = search_stocks(q)
    return {"success": True, "results": results, "count": len(results)}


@router.get("/{ticker}")
async def stock_detail(
    ticker: str, 
    exchange: str = Query("NSE", description="Exchange: NSE or BSE"),
    period: str = Query("6mo", description="Period: 1mo, 3mo, 6mo, 1y")
):
    """
    Get detailed stock data with historical prices.
    Example: /api/stock/RELIANCE?exchange=NSE&period=6mo
    """
    data = get_stock_history(ticker.upper(), exchange, period)
    if "error" in data:
        return {"success": False, "error": data["error"]}
    return {"success": True, "data": data}
