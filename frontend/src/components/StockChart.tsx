"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { HistoryPoint, EnsemblePrediction } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { useState } from "react";

interface Props {
  history: HistoryPoint[];
  predictions?: EnsemblePrediction[];
  currentPrice?: number;
}

export default function StockChart({ history, predictions, currentPrice }: Props) {
  const [showPredictions, setShowPredictions] = useState(true);

  // Combine history + predictions
  const historyData = history.slice(-60).map((h) => ({
    date: h.date,
    price: h.close,
    type: "history" as const,
  }));

  const predictionData = predictions && showPredictions
    ? predictions.map((p) => ({
        date: p.date,
        predicted: p.predicted_price,
        prophet: p.prophet_price,
        arima: p.arima_price,
        lower: p.lower_bound,
        upper: p.upper_bound,
        type: "prediction" as const,
      }))
    : [];

  // Bridge: last history point connects to first prediction
  const bridgePoint = historyData.length > 0 && predictionData.length > 0
    ? { ...historyData[historyData.length - 1], predicted: historyData[historyData.length - 1].price }
    : null;

  const combined = [
    ...historyData.map((d) => ({ ...d, predicted: undefined, prophet: undefined, arima: undefined, lower: undefined, upper: undefined })),
    ...(bridgePoint ? [{ ...bridgePoint, prophet: undefined, arima: undefined, lower: undefined, upper: undefined, type: "history" as const }] : []),
    ...predictionData.map((d) => ({ ...d, price: undefined })),
  ];

  // Y-axis domain
  const allPrices = [
    ...historyData.map((d) => d.price),
    ...predictionData.map((d) => d.predicted),
    ...predictionData.map((d) => d.lower).filter(Boolean),
    ...predictionData.map((d) => d.upper).filter(Boolean),
  ].filter((v): v is number => v !== undefined);
  
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Price Chart</h3>
        {predictions && predictions.length > 0 && (
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              showPredictions
                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                : "bg-[#1a1a1a] border-[#333] text-gray-500"
            }`}
          >
            {showPredictions ? "Hide" : "Show"} Predictions
          </button>
        )}
      </div>
      
      <div className="flex gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block" /> Historical</span>
        {showPredictions && predictions && predictions.length > 0 && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-400 inline-block" /> Ensemble</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-400 inline-block opacity-50" /> Prophet</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block opacity-50" /> ARIMA</span>
          </>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={combined}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#666", fontSize: 11 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: "#666", fontSize: 11 }}
            tickFormatter={(v) => `₹${Math.round(v)}`}
          />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#888" }}
            formatter={(value?: number | string, name?: string) => {
              if (value === undefined || value === null) return ["N/A", name || ""];
              const labels: Record<string, string> = { price: "Price", predicted: "Ensemble", prophet: "Prophet", arima: "ARIMA", lower: "Lower", upper: "Upper" };
              return [formatINR(Number(value)), labels[name || ""] || name || ""];
            }}
          />
          {currentPrice && <ReferenceLine y={currentPrice} stroke="#3b82f6" strokeDasharray="5 5" strokeOpacity={0.4} />}
          
          {/* Confidence band */}
          <Area dataKey="upper" stroke="none" fill="none" />
          <Area dataKey="lower" stroke="none" fill="#22c55e" fillOpacity={0.05} />
          
          {/* Historical price */}
          <Area dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#priceGrad)" dot={false} connectNulls={false} />
          
          {/* Predictions */}
          <Line dataKey="predicted" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} connectNulls={false} />
          <Line dataKey="prophet" stroke="#a855f7" strokeWidth={1} strokeDasharray="4 4" dot={false} connectNulls={false} />
          <Line dataKey="arima" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" dot={false} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
