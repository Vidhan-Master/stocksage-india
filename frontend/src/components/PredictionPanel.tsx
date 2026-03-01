"use client";

import { PredictionResult } from "@/lib/api";
import { formatINR, changeColor, signalColor } from "@/lib/utils";
import { Brain, TrendingUp, TrendingDown, Target, Shield, Activity } from "lucide-react";

interface Props {
  prediction: PredictionResult;
}

export default function PredictionPanel({ prediction }: Props) {
  const p = prediction;
  const isUp = p.predicted_change >= 0;
  const ti = p.technical_indicators;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Signal Card */}
      <div className={`rounded-xl border p-5 ${signalColor(p.signal)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain size={28} />
            <div>
              <div className="text-2xl font-bold">{p.signal}</div>
              <div className="text-sm opacity-80">AI Recommendation</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Shield size={16} />
              <span className="text-xl font-bold">{p.confidence_score.toFixed(1)}%</span>
            </div>
            <div className="text-xs opacity-70">Confidence</div>
          </div>
        </div>
      </div>

      {/* Price Prediction */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-4">
        <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <Target size={14} /> 7-Day Price Target
        </h4>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-gray-500">Current</div>
            <div className="text-xl font-bold">{formatINR(p.current_price)}</div>
          </div>
          <div className="text-center px-4">
            {isUp ? <TrendingUp size={24} className="text-green-400 mx-auto" /> : <TrendingDown size={24} className="text-red-400 mx-auto" />}
            <div className={`text-sm font-semibold mt-1 ${changeColor(p.predicted_change)}`}>
              {isUp ? "+" : ""}{p.predicted_change.toFixed(2)} ({isUp ? "+" : ""}{p.predicted_change_percent.toFixed(2)}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Target</div>
            <div className={`text-xl font-bold ${changeColor(p.predicted_change)}`}>{formatINR(p.predicted_price)}</div>
          </div>
        </div>
      </div>

      {/* Day-by-day predictions */}
      {p.ensemble_predictions.length > 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-3">📅 Day-by-Day Forecast</h4>
          <div className="space-y-2">
            {p.ensemble_predictions.map((ep, i) => {
              const prevPrice = i === 0 ? p.current_price : p.ensemble_predictions[i - 1].predicted_price;
              const dayChange = ep.predicted_price - prevPrice;
              const dayPct = (dayChange / prevPrice) * 100;
              return (
                <div key={ep.date} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                  <span className="text-sm text-gray-400 w-24">
                    {new Date(ep.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="font-semibold">{formatINR(ep.predicted_price)}</span>
                  <span className={`text-sm ${changeColor(dayChange)}`}>
                    {dayChange >= 0 ? "+" : ""}{dayPct.toFixed(2)}%
                  </span>
                  <div className="text-xs text-gray-600 w-32 text-right">
                    P: {formatINR(ep.prophet_price)} | A: {formatINR(ep.arima_price)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Indicators */}
      {ti && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <Activity size={14} /> Technical Indicators
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <TICard label="RSI (14)" value={ti.rsi?.toFixed(1) || "N/A"} color={ti.rsi < 30 ? "text-green-400" : ti.rsi > 70 ? "text-red-400" : "text-yellow-400"} hint={ti.rsi < 30 ? "Oversold" : ti.rsi > 70 ? "Overbought" : "Neutral"} />
            <TICard label="MACD" value={ti.macd?.toFixed(2) || "N/A"} color={ti.macd > ti.macd_signal ? "text-green-400" : "text-red-400"} hint={ti.macd > ti.macd_signal ? "Bullish" : "Bearish"} />
            <TICard label="SMA 7" value={formatINR(ti.sma_7)} color={p.current_price > ti.sma_7 ? "text-green-400" : "text-red-400"} />
            <TICard label="SMA 21" value={formatINR(ti.sma_21)} color={p.current_price > ti.sma_21 ? "text-green-400" : "text-red-400"} />
            <TICard label="Bollinger Upper" value={formatINR(ti.bollinger_upper)} />
            <TICard label="Bollinger Lower" value={formatINR(ti.bollinger_lower)} />
            <TICard label="Volatility" value={`${(ti.volatility * 100).toFixed(2)}%`} color={ti.volatility > 0.03 ? "text-red-400" : "text-green-400"} />
          </div>
        </div>
      )}
    </div>
  );
}

function TICard({ label, value, color, hint }: { label: string; value: string; color?: string; hint?: string }) {
  return (
    <div className="bg-[#0a0a0a] rounded-lg p-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-semibold text-sm ${color || "text-white"}`}>{value}</div>
      {hint && <div className="text-xs text-gray-600">{hint}</div>}
    </div>
  );
}
