"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";
import CoinChart from "@/components/CoinChart";
import SignalCard from "@/components/SignalCard";
import RiskCalculator from "@/components/RiskCalculator";
import CoinAvatar from "@/components/CoinAvatar";
import { getTicker, getKlines, baseAssetFromSymbol, formatPrice, formatCompactNumber, ParsedTicker } from "@/lib/binance";
import { generateSignal, SignalResult } from "@/lib/indicators";
import { isInWatchlist, toggleWatchlist } from "@/lib/storage";

export default function CoinDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params?.symbol as string)?.toUpperCase();

  const [ticker, setTicker] = useState<ParsedTicker | null>(null);
  const [signal, setSignal] = useState<SignalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isInWatchlist(symbol));
  }, [symbol]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setError(null);
        const [t, klines] = await Promise.all([
          getTicker(symbol),
          getKlines(symbol, "1h", 300),
        ]);
        if (!mounted) return;
        setTicker(t);
        setSignal(generateSignal(klines));
      } catch (e) {
        if (mounted) setError("Could not load data for this coin.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const handleToggleWatch = () => {
    toggleWatchlist(symbol);
    setWatched((v) => !v);
  };

  const isPositive = (ticker?.changePercent ?? 0) >= 0;

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surfaceAlt border-b border-borderc safe-top">
        <div className="flex items-center gap-2 px-3 py-3">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={22} color="#E9EDEF" />
          </button>
          {ticker && (
            <CoinAvatar symbol={baseAssetFromSymbol(symbol)} size={26} />
          )}
          <h1 className="text-sm font-semibold text-textPrimary flex-1 truncate">
            {baseAssetFromSymbol(symbol)}/USDT
          </h1>
          <button onClick={handleToggleWatch} className="p-1">
            <Star
              size={20}
              fill={watched ? "#00A884" : "none"}
              color={watched ? "#00A884" : "#8696A0"}
            />
          </button>
        </div>
      </header>

      {loading && (
        <div className="px-4 py-10 text-center text-textSecondary text-sm">
          Loading {baseAssetFromSymbol(symbol)} data…
        </div>
      )}

      {error && !loading && (
        <div className="px-4 py-10 text-center text-danger text-sm">{error}</div>
      )}

      {!loading && !error && ticker && (
        <div className="px-4 pt-4 pb-6 space-y-4">
          {/* Price header */}
          <div>
            <p className="text-2xl font-bold text-textPrimary">
              ${formatPrice(ticker.price)}
            </p>
            <p
              className={`text-sm font-medium mt-0.5 ${
                isPositive ? "text-secondary" : "text-danger"
              }`}
            >
              {isPositive ? "+" : ""}
              {ticker.changePercent.toFixed(2)}% (24h)
            </p>
          </div>

          {/* Chart */}
          <CoinChart symbol={symbol} />

          {/* AI Analysis */}
          {signal ? (
            <div>
              <h2 className="text-sm font-semibold text-textPrimary mb-2">
                AI Analysis
              </h2>
              <SignalCard signal={signal} />
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-borderc p-4 text-center text-xs text-textSecondary">
              Not enough historical data yet to generate a reliable AI signal for this pair.
            </div>
          )}

          {/* Key Stats */}
          <div>
            <h2 className="text-sm font-semibold text-textPrimary mb-2">Key Stats</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface rounded-xl border border-borderc p-3">
                <p className="text-[10px] text-textSecondary mb-0.5">24h High</p>
                <p className="text-sm font-semibold text-secondary">
                  ${formatPrice(ticker.high24h)}
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-borderc p-3">
                <p className="text-[10px] text-textSecondary mb-0.5">24h Low</p>
                <p className="text-sm font-semibold text-danger">
                  ${formatPrice(ticker.low24h)}
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-borderc p-3">
                <p className="text-[10px] text-textSecondary mb-0.5">24h Volume</p>
                <p className="text-sm font-semibold text-textPrimary">
                  {formatCompactNumber(ticker.volume)} {ticker.baseAsset}
                </p>
              </div>
              <div className="bg-surface rounded-xl border border-borderc p-3">
                <p className="text-[10px] text-textSecondary mb-0.5">Quote Volume</p>
                <p className="text-sm font-semibold text-textPrimary">
                  ${formatCompactNumber(ticker.quoteVolume)}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Calculator */}
          <div>
            <h2 className="text-sm font-semibold text-textPrimary mb-2">
              Risk Calculator
            </h2>
            <RiskCalculator
              defaultEntry={signal?.entry ?? ticker.price}
              defaultStopLoss={signal?.stopLoss}
            />
          </div>
        </div>
      )}
    </div>
  );
}
