"use client";

import { useEffect, useState } from "react";
import {
  getFearGreedIndex,
  getGlobalMarketData,
  formatCompactNumber,
  FearGreedData,
  GlobalMarketData,
} from "@/lib/binance";

function fearGreedColor(value: number): string {
  if (value <= 24) return "#F6465D"; // Extreme Fear
  if (value <= 44) return "#F59E0B"; // Fear
  if (value <= 55) return "#8696A0"; // Neutral
  if (value <= 75) return "#25D366"; // Greed
  return "#00A884"; // Extreme Greed
}

export default function MarketOverview() {
  const [global, setGlobal] = useState<GlobalMarketData | null>(null);
  const [fng, setFng] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getGlobalMarketData(), getFearGreedIndex()]).then(
      ([g, f]) => {
        if (!mounted) return;
        setGlobal(g);
        setFng(f);
        setLoading(false);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2 px-4 pt-3">
      <div className="bg-surface rounded-xl p-3 border border-borderc">
        <p className="text-[10px] text-textSecondary mb-1">Market Cap</p>
        {loading ? (
          <div className="h-4 w-14 bg-borderc rounded animate-pulse" />
        ) : (
          <>
            <p className="text-sm font-semibold text-textPrimary">
              ${global ? formatCompactNumber(global.totalMarketCapUsd) : "—"}
            </p>
            {global && (
              <p
                className={`text-[10px] font-medium ${
                  global.marketCapChangePercent24h >= 0
                    ? "text-secondary"
                    : "text-danger"
                }`}
              >
                {global.marketCapChangePercent24h >= 0 ? "+" : ""}
                {global.marketCapChangePercent24h.toFixed(2)}%
              </p>
            )}
          </>
        )}
      </div>

      <div className="bg-surface rounded-xl p-3 border border-borderc">
        <p className="text-[10px] text-textSecondary mb-1">BTC Dominance</p>
        {loading ? (
          <div className="h-4 w-10 bg-borderc rounded animate-pulse" />
        ) : (
          <p className="text-sm font-semibold text-textPrimary">
            {global ? global.btcDominance.toFixed(1) : "—"}%
          </p>
        )}
      </div>

      <div className="bg-surface rounded-xl p-3 border border-borderc">
        <p className="text-[10px] text-textSecondary mb-1">Fear &amp; Greed</p>
        {loading ? (
          <div className="h-4 w-10 bg-borderc rounded animate-pulse" />
        ) : (
          <>
            <p
              className="text-sm font-semibold"
              style={{ color: fng ? fearGreedColor(fng.value) : "#E9EDEF" }}
            >
              {fng ? fng.value : "—"}
            </p>
            <p className="text-[10px] text-textSecondary truncate">
              {fng ? fng.classification : "Unavailable"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
