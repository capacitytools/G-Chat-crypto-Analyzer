"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Radio } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import CoinAvatar from "@/components/CoinAvatar";
import SignalCard from "@/components/SignalCard";
import { scanTopVolumeCoins, filterActionable, ScannedCoin } from "@/lib/scanner";
import { formatPrice } from "@/lib/binance";

const CACHE_KEY = "gchat_hourly_signals_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type FilterKey = "all" | "buy" | "sell";

export default function SignalsPage() {
  const [scanned, setScanned] = useState<ScannedCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  async function runScan(force = false) {
    setError(null);
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            setScanned(cached.scanned);
            setLastUpdated(cached.timestamp);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    setScanning(true);
    try {
      const results = await scanTopVolumeCoins(40, "1h");
      const actionable = filterActionable(results);
      setScanned(actionable);
      const ts = Date.now();
      setLastUpdated(ts);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: ts, scanned: actionable })
      );
    } catch (e) {
      setError("Failed to generate signals. Please try again.");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }

  useEffect(() => {
    runScan(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = scanned.filter((s) => {
    if (filter === "buy") return s.signal.action.includes("BUY");
    if (filter === "sell") return s.signal.action.includes("SELL");
    return true;
  });

  return (
    <div>
      <AppHeader title="Hourly Signals" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-textSecondary text-xs">
            <Radio size={13} color="#00A884" />
            <span>1H timeframe · top 40 coins by volume</span>
          </div>
          <button
            onClick={() => runScan(true)}
            disabled={scanning}
            className="flex items-center gap-1 text-xs text-primary font-medium disabled:opacity-50"
          >
            <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
            {scanning ? "Scanning…" : "Refresh"}
          </button>
        </div>

        <div className="flex gap-2">
          {(["all", "buy", "sell"] as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border capitalize ${
                filter === f
                  ? "bg-primary text-appbg border-primary"
                  : "bg-surface text-textSecondary border-borderc"
              }`}
            >
              {f === "all" ? "All Signals" : `${f} Signals`}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-16 text-center">
            <RefreshCw size={22} className="animate-spin mx-auto mb-3" color="#00A884" />
            <p className="text-sm text-textSecondary">Generating hourly signals…</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center text-danger text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-10 text-center text-textSecondary text-sm">
            No actionable signals right now — market conditions are mostly neutral.
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.ticker.symbol}>
                <div className="flex items-center gap-2 mb-1.5">
                  <CoinAvatar symbol={s.ticker.baseAsset} size={24} />
                  <span className="text-sm font-semibold text-textPrimary">
                    {s.ticker.baseAsset}/USDT
                  </span>
                  <span className="text-xs text-textSecondary ml-auto">
                    ${formatPrice(s.ticker.price)}
                  </span>
                </div>
                <SignalCard signal={s.signal} compact />
              </div>
            ))}
          </div>
        )}

        {lastUpdated && !loading && (
          <p className="text-[10px] text-textSecondary text-center">
            Last scanned {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
