"use client";

import { changeColor } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Mover {
  ticker: string;
  name: string;
  price: number;
  change_percent: number;
}

interface Props {
  gainers: Mover[];
  losers: Mover[];
  onSelect: (ticker: string) => void;
}

export default function TopMovers({ gainers, losers, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#111] border border-[#222] rounded-xl p-4">
        <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-green-400" /> Top Gainers
        </h3>
        <div className="space-y-2">
          {gainers.map((g) => (
            <button
              key={g.ticker}
              onClick={() => onSelect(g.ticker)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <div>
                <span className="font-semibold text-sm">{g.ticker}</span>
                <span className="text-gray-500 text-xs ml-2">{g.name}</span>
              </div>
              <span className="text-green-400 text-sm font-semibold">+{g.change_percent.toFixed(2)}%</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-4">
        <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <TrendingDown size={14} className="text-red-400" /> Top Losers
        </h3>
        <div className="space-y-2">
          {losers.map((l) => (
            <button
              key={l.ticker}
              onClick={() => onSelect(l.ticker)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <div>
                <span className="font-semibold text-sm">{l.ticker}</span>
                <span className="text-gray-500 text-xs ml-2">{l.name}</span>
              </div>
              <span className="text-red-400 text-sm font-semibold">{l.change_percent.toFixed(2)}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
