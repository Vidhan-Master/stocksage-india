"""
Market Routes - Market overview, indices data
"""

from fastapi import APIRouter

from app.services.stock_service import get_market_overview, get_index_data, INDICES

router = APIRouter()


@router.get("/overview")
async def market_overview():
    """
    Get full market overview:
    - NIFTY 50, SENSEX, Bank NIFTY values
    - Top 5 gainers & losers
    - Sector-wise breakdown
    """
    data = get_market_overview()
    return {"success": True, "data": data}


@router.get("/index/{index_name}")
async def index_data(index_name: str):
    """Get data for a specific index (NIFTY50, SENSEX, BANKNIFTY, NIFTYIT)"""
    data = get_index_data(index_name.upper())
    if "error" in data:
        return {"success": False, "error": data["error"]}
    return {"success": True, "data": data}


@router.get("/indices")
async def all_indices():
    """Get all available indices"""
    results = []
    for index_name in INDICES:
        data = get_index_data(index_name)
        if "error" not in data:
            results.append(data)
    return {"success": True, "data": results}
