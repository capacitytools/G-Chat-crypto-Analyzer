"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import CoinAvatar from "./CoinAvatar";
import { formatPrice, formatCompactNumber, ParsedTicker } from "@/lib/binance";

interface CoinListRowProps {
  ticker: ParsedTicker;
  isWatched: boolean;
  onToggleWatch: (symbol: string) => void;
}

export default function CoinListRow({
  ticker,
  isWatched,
  onToggleWatch,
}: CoinListRowProps) {
  const isPositive = ticker.changePercent >= 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-borderc active:bg-surface/60 transition-colors">
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleWatch(ticker.symbol);
        }}
        className="shrink-0"
        aria-label="Toggle watchlist"
      >
        <Star
          size={18}
          fill={isWatched ? "#00A884" : "none"}
          color={isWatched ? "#00A884" : "#8696A0"}
        />
      </button>

      <Link
        href={`/markets/${ticker.symbol}`}
        className="flex items-center justify-between flex-1 min-w-0"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CoinAvatar symbol={ticker.baseAsset} size={34} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-textPrimary truncate">
              {ticker.baseAsset}
              <span className="text-textSecondary font-normal">/USDT</span>
            </p>
            <p className="text-xs text-textSecondary">
              Vol {formatCompactNumber(ticker.quoteVolume)}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 ml-2">
          <p className="text-sm font-semibold text-textPrimary">
            ${formatPrice(ticker.price)}
          </p>
          <p
            className={`text-xs font-medium ${
              isPositive ? "text-secondary" : "text-danger"
            }`}
          >
            {isPositive ? "+" : ""}
            {ticker.changePercent.toFixed(2)}%
          </p>
        </div>
      </Link>
    </div>
  );
}
