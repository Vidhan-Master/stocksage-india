"""
Utility functions for StockSage India
"""


def format_inr(amount: float) -> str:
    """
    Format number in Indian currency style.
    Example: 142500.75 -> ₹1,42,500.75
    """
    if amount < 0:
        return f"-{format_inr(-amount)}"

    # Split integer and decimal parts
    str_amount = f"{amount:.2f}"
    integer_part, decimal_part = str_amount.split(".")

    # Indian numbering: last 3 digits, then groups of 2
    if len(integer_part) <= 3:
        formatted = integer_part
    else:
        last_three = integer_part[-3:]
        remaining = integer_part[:-3]

        # Group remaining digits in pairs from right
        groups = []
        while len(remaining) > 2:
            groups.append(remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.append(remaining)

        groups.reverse()
        formatted = ",".join(groups) + "," + last_three

    return f"₹{formatted}.{decimal_part}"


def calculate_rsi(prices: list, period: int = 14) -> float:
    """Calculate Relative Strength Index"""
    if len(prices) < period + 1:
        return 50.0  # Default neutral

    gains = []
    losses = []

    for i in range(1, len(prices)):
        change = prices[i] - prices[i - 1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))

    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period

    if avg_loss == 0:
        return 100.0

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return round(rsi, 2)


def calculate_moving_average(prices: list, window: int = 20) -> list:
    """Calculate Simple Moving Average"""
    if len(prices) < window:
        return []

    ma = []
    for i in range(window - 1, len(prices)):
        avg = sum(prices[i - window + 1:i + 1]) / window
        ma.append(round(avg, 2))

    return ma
