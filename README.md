# 🧠 StockSage India

**AI-Powered Stock Predictions for Indian Markets (NSE/BSE)**

Built with **FastAPI + Next.js + Prophet + ARIMA** — get 7-day stock forecasts with confidence scores, technical indicators, and buy/sell/hold signals.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- 📈 **Real-time stock data** — Live prices from NSE/BSE via yfinance
- 🤖 **ML Predictions** — Ensemble model (60% Prophet + 40% ARIMA) for 7-day forecasts
- 📊 **Interactive Charts** — Price history with prediction overlay using Recharts
- 🔍 **Stock Search** — Autocomplete search across 30+ major Indian stocks
- 📉 **Market Overview** — NIFTY 50, SENSEX, Bank NIFTY, NIFTY IT indices
- 🏆 **Top Movers** — Daily top gainers and losers
- 🎯 **Trading Signals** — BUY/SELL/HOLD with confidence score & RSI/MACD indicators
- 🌙 **Dark Theme** — Beautiful dark UI built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Recharts, Axios |
| **Backend** | FastAPI, Python 3.11+, Uvicorn |
| **ML Models** | Facebook Prophet, ARIMA (statsmodels) |
| **Data** | yfinance (Yahoo Finance API) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### 1. Clone the repo
```bash
git clone https://github.com/Vidhan-Master/stocksage-india.git
cd stocksage-india
```

### 2. Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend
```bash
cd frontend
npm install
npx next dev --port 3000
```

### 4. Open in browser
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/stock/search?q=reliance` | GET | Search stocks |
| `/api/stock/RELIANCE?exchange=NSE` | GET | Stock detail + history |
| `/api/market/overview` | GET | Market indices, gainers, losers |
| `/api/predict/` | POST | ML prediction (7-day forecast) |

---

## 📂 Project Structure

```
stocksage-india/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── models/predictor.py  # Prophet + ARIMA ML models
│   │   ├── routes/              # API route handlers
│   │   ├── services/            # Stock data service (yfinance)
│   │   └── utils/               # Helpers (INR formatting)
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── app/page.tsx         # Main dashboard
│   │   ├── components/          # React components
│   │   └── lib/                 # API client & utilities
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚠️ Disclaimer

This project is for **educational purposes only**. AI predictions are not financial advice. Always do your own research before making investment decisions.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
