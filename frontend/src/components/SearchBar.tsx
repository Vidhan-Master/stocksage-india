"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { searchStocks, SearchResult } from "@/lib/api";

interface Props {
  onSelect: (ticker: string, exchange: string) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchStocks(query);
        setResults(data || []);
        setIsOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center bg-[#111] border border-[#333] rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search stocks... (e.g. Reliance, TCS)"
          className="bg-transparent outline-none text-white w-full text-sm placeholder-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && results.length > 0 && setIsOpen(true)}
        />
        {query && (
          <X size={16} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => { setQuery(""); setResults([]); }} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#111] border border-[#333] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={`${r.ticker}-${r.nse}`}
              className="w-full text-left px-4 py-3 hover:bg-[#1a1a1a] flex justify-between items-center border-b border-[#222] last:border-0 transition-colors"
              onClick={() => {
                onSelect(r.ticker, "NSE");
                setQuery(r.name);
                setIsOpen(false);
              }}
            >
              <div>
                <span className="font-semibold text-white">{r.ticker}</span>
                <span className="text-gray-400 text-sm ml-2">{r.name}</span>
              </div>
              <span className="text-xs bg-[#222] px-2 py-1 rounded text-gray-400">NSE</span>
            </button>
          ))}
        </div>
      )}
      {loading && (
        <div className="absolute top-full mt-1 w-full bg-[#111] border border-[#333] rounded-lg p-3 text-center text-gray-500 text-sm z-50">
          Searching...
        </div>
      )}
    </div>
  );
}
