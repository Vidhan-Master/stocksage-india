"use client";

import { useState, useEffect } from "react";
import {
  getMarketOverview,
  getStockData,
  getPrediction,
  MarketOverview,
  StockData,
  PredictionResult,
} from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import MarketTicker from "@/components/MarketTicker";
import StockInfo from "@/components/StockInfo";
import StockChart from "@/components/StockChart";
import PredictionPanel from "@/components/PredictionPanel";
import TopMovers from "@/components/TopMovers";
import { Brain, Loader2, AlertCircle, BarChart3, ArrowLeft } from "lucide-react";

export default function Home() {
  const [market, setMarket] = useState<MarketOverview | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState({ market: true, stock: false, prediction: false });
  const [error, setError] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  function goHome() {
    setSelectedTicker(null);
    setStock(null);
    setPrediction(null);
    setError(null);
  }

  // Load market overview on mount
  useEffect(() => {
    loadMarket();
  }, []);

  async function loadMarket() {
    setLoading((l) => ({ ...l, market: true }));
    try {
      const data = await getMarketOverview();
      setMarket(data);
    } catch (e) {
      console.error("Failed to load market data:", e);
    }
    setLoading((l) => ({ ...l, market: false }));
  }

  async function handleSelectStock(ticker: string, exchange = "NSE") {
    setSelectedTicker(ticker);
    setError(null);
    setPrediction(null);

    // Load stock data
    setLoading((l) => ({ ...l, stock: true }));
    try {
      const data = await getStockData(ticker, exchange, "6mo");
      setStock(data);
    } catch (e: any) {
      setError(`Failed to load stock data for ${ticker}`);
      setStock(null);
    }
    setLoading((l) => ({ ...l, stock: false }));

    // Load prediction
    setLoading((l) => ({ ...l, prediction: true }));
    try {
      const pred = await getPrediction(ticker, exchange, 7);
      setPrediction(pred);
    } catch (e: any) {
      console.error("Prediction error:", e);
    }
    setLoading((l) => ({ ...l, prediction: false }));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={goHome}>
              <Brain size={28} className="text-blue-500" />
              <div>
                <h1 className="text-lg font-bold leading-tight">StockSage India</h1>
                <p className="text-[10px] text-gray-500">AI-Powered Predictions</p>
              </div>
            </div>
            <SearchBar onSelect={(ticker, exchange) => handleSelectStock(ticker, exchange)} />
          </div>
        </div>
      </header>

      {/* Market Ticker */}
      <MarketTicker indices={market?.indices || []} loading={loading.market} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* No stock selected — show market overview */}
        {!selectedTicker && !loading.stock && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-12">
              <Brain size={64} className="text-blue-500/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to StockSage India 📈</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                AI-powered stock predictions for Indian markets. Search for any NSE/BSE stock to get 7-day forecasts using Prophet + ARIMA models.
              </p>
            </div>
            {market && (
              <TopMovers
                gainers={market.top_gainers}
                losers={market.top_losers}
                onSelect={(ticker) => handleSelectStock(ticker)}
              />
            )}
          </div>
        )}

        {/* Stock loading */}
        {loading.stock && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-500 mr-3" />
            <span className="text-gray-400">Loading {selectedTicker} data...</span>
          </div>
        )}

        {/* Stock selected — show details */}
        {stock && !loading.stock && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={goHome}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Chart + Stock Info */}
            <div className="lg:col-span-2 space-y-6">
              <StockInfo data={stock} />
              <StockChart
                history={stock.history}
                predictions={prediction?.ensemble_predictions}
                currentPrice={stock.current_price}
              />
            </div>

            {/* Right: Prediction Panel */}
            <div className="space-y-4">
              {loading.prediction ? (
                <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
                  <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Running AI prediction...</p>
                  <p className="text-gray-600 text-xs mt-1">Prophet + ARIMA analysis</p>
                </div>
              ) : prediction ? (
                <PredictionPanel prediction={prediction} />
              ) : (
                <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
                  <BarChart3 size={32} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Prediction not available</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] mt-12 py-4 text-center text-xs text-gray-600">
        StockSage India — AI predictions are for educational purposes only. Not financial advice.
      </footer>
    </div>
  );
}
