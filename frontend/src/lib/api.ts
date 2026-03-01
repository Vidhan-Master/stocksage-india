import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for ML predictions
});

// Types
export interface StockData {
  ticker: string;
  exchange: string;
  full_ticker: string;
  name: string;
  name_hi?: string;
  sector: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  currency: string;
  day_high: number;
  day_low: number;
  volume: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  history: HistoryPoint[];
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PredictionResult {
  ticker: string;
  exchange: string;
  current_price: number;
  predicted_price: number;
  predicted_change: number;
  predicted_change_percent: number;
  signal: "BUY" | "SELL" | "HOLD";
  confidence_score: number;
  ensemble_predictions: EnsemblePrediction[];
  prophet_predictions: Prediction[];
  arima_predictions: Prediction[];
  technical_indicators: TechnicalIndicators;
  historical_data: HistoryPoint[];
}

export interface EnsemblePrediction {
  date: string;
  predicted_price: number;
  prophet_price: number;
  arima_price: number;
  lower_bound: number;
  upper_bound: number;
}

export interface Prediction {
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
}

export interface TechnicalIndicators {
  rsi: number;
  sma_7: number;
  sma_21: number;
  ema_12: number;
  ema_26: number;
  macd: number;
  macd_signal: number;
  bollinger_upper: number;
  bollinger_lower: number;
  volatility: number;
}

export interface IndexData {
  name: string;
  value: number;
  change: number;
  change_percent: number;
}

export interface MarketOverview {
  indices: IndexData[];
  top_gainers: { ticker: string; name: string; price: number; change_percent: number }[];
  top_losers: { ticker: string; name: string; price: number; change_percent: number }[];
  sectors: Record<string, { ticker: string; name: string; price: number; change_percent: number }[]>;
}

export interface SearchResult {
  ticker: string;
  name: string;
  name_hi?: string;
  sector: string;
  nse: string;
  bse: string;
}

// API Functions
export async function getMarketOverview(): Promise<MarketOverview> {
  const res = await api.get("/api/market/overview");
  return res.data.data;
}

export async function getStockData(ticker: string, exchange = "NSE", period = "6mo"): Promise<StockData> {
  const res = await api.get(`/api/stock/${ticker}`, { params: { exchange, period } });
  if (!res.data.success) throw new Error(res.data.error || "Failed to load stock");
  return res.data.data;
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  const res = await api.get("/api/stock/search", { params: { q: query } });
  return res.data.results;
}

export async function getPrediction(ticker: string, exchange = "NSE", horizon = 7): Promise<PredictionResult> {
  const res = await api.post("/api/predict/", { ticker, exchange, horizon });
  return res.data.data;
}
