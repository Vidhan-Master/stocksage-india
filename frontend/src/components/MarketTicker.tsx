"use client";

import { IndexData } from "@/lib/api";
import { formatINR, changeColor } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  indices: IndexData[];
  loading?: boolean;
}

export default function MarketTicker({ indices = [], loading }: Props) {
  if (loading || !indices || indices.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto py-3 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-16 w-48 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto py-3 px-4 no-scrollbar">
      {indices.map((idx, i) => {
        const isUp = idx.change_percent > 0;
        const isDown = idx.change_percent < 0;
        return (
          <div
            key={idx.name || i}
            className={`flex-shrink-0 px-4 py-3 rounded-lg border ${
              isUp ? "bg-green-500/5 border-green-500/20" : isDown ? "bg-red-500/5 border-red-500/20" : "bg-[#111] border-[#222]"
            }`}
          >
            <div className="text-xs text-gray-400 mb-1">{idx.name}</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{formatINR(idx.value)}</span>
              <span className={`flex items-center text-sm ${changeColor(idx.change_percent)}`}>
                {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
                <span className="ml-1">{idx.change_percent > 0 ? "+" : ""}{idx.change_percent.toFixed(2)}%</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
