"use client";

import { StockData } from "@/lib/api";
import { formatINR, formatCompact, changeColor } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";

interface Props {
  data: StockData;
}

export default function StockInfo({ data }: Props) {
  const isUp = data.change >= 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">{data.ticker}</h2>
            <span className="text-xs bg-[#222] px-2 py-1 rounded text-gray-400">{data.exchange}</span>
          </div>
          <p className="text-gray-400 mt-1">{data.name}</p>
          {data.sector && <p className="text-xs text-gray-500 mt-1">Sector: {data.sector}</p>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{formatINR(data.current_price)}</div>
          <div className={`flex items-center justify-end gap-1 mt-1 ${changeColor(data.change)}`}>
            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{isUp ? "+" : ""}{data.change.toFixed(2)}</span>
            <span>({isUp ? "+" : ""}{data.change_percent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Day High" value={formatINR(data.day_high)} />
        <StatCard label="Day Low" value={formatINR(data.day_low)} />
        <StatCard label="52W High" value={formatINR(data.fifty_two_week_high)} />
        <StatCard label="52W Low" value={formatINR(data.fifty_two_week_low)} />
        <StatCard label="Prev Close" value={formatINR(data.previous_close)} />
        <StatCard label="Volume" value={formatCompact(data.volume)} icon={<BarChart3 size={14} />} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-3">
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}
