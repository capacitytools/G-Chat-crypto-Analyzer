"use client";

import { useEffect, useState } from "react";
import { Crown, RefreshCw } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import CoinAvatar from "@/components/CoinAvatar";
import SignalCard from "@/components/SignalCard";
import { scanTopVolumeCoins, ScannedCoin } from "@/lib/scanner";
import { baseAssetFromSymbol, formatPrice } from "@/lib/binance";
import Link from "next/link";

const CACHE_KEY = "gchat_daily_pick_cache_v1";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedPick {
  timestamp: number;
  scanned: ScannedCoin[];
}

export default function AiDailyPage() {
  const [scanned, setScanned] = useState<ScannedCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  async function runScan(force = false) {
    setError(null);
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CachedPick = JSON.parse(raw);
          if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            setScanned(cached.scanned);
            setLastUpdated(cached.timestamp);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore cache errors, fall through to live scan
      }
    }

    setScanning(true);
    try {
      const results = await scanTopVolumeCoins(50, "1h");
      setScanned(results);
      const ts = Date.now();
      setLastUpdated(ts);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: ts, scanned: results })
      );
    } catch (e) {
      setError("Scan failed. Please try again.");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }

  useEffect(() => {
    runScan(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goldenPick = scanned.find((s) => s.signal.action === "STRONG_BUY") ?? scanned[0];
  const runnersUp = scanned.filter((s) => s !== goldenPick).slice(0, 6);

  return (
    <div>
      <AppHeader title="AI Daily Pick" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-textSecondary">
            Scans top 50 coins by volume every refresh
          </p>
          <button
            onClick={() => runScan(true)}
            disabled={scanning}
            className="flex items-center gap-1 text-xs text-primary font-medium disabled:opacity-50"
          >
            <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
            {scanning ? "Scanning…" : "Refresh"}
          </button>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <RefreshCw size={22} className="animate-spin mx-auto mb-3" color="#00A884" />
            <p className="text-sm text-textSecondary">
              Scanning the top 50 coins by volume…
            </p>
            <p className="text-xs text-textSecondary mt-1">
              This runs the full AI engine live — may take a moment.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center text-danger text-sm">{error}</div>
        )}

        {!loading && !error && goldenPick && (
          <>
            {/* Golden Pick banner */}
            <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 to-surface p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown size={18} color="#00A884" />
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  Today&apos;s Golden Pick
                </span>
              </div>

              <Link
                href={`/markets/${goldenPick.ticker.symbol}`}
                className="flex items-center gap-3 mb-3"
              >
                <CoinAvatar symbol={goldenPick.ticker.baseAsset} size={44} />
                <div>
                  <p className="text-lg font-bold text-textPrimary">
                    {goldenPick.ticker.baseAsset}
                    <span className="text-textSecondary font-normal text-sm">
                      /USDT
                    </span>
                  </p>
                  <p className="text-sm text-textSecondary">
                    ${formatPrice(goldenPick.ticker.price)}{" "}
                    <span
                      className={
                        goldenPick.ticker.changePercent >= 0
                          ? "text-secondary"
                          : "text-danger"
                      }
                    >
                      ({goldenPick.ticker.changePercent >= 0 ? "+" : ""}
                      {goldenPick.ticker.changePercent.toFixed(2)}%)
                    </span>
                  </p>
                </div>
              </Link>

              <SignalCard signal={goldenPick.signal} />
            </div>

            {/* Runners up */}
            {runnersUp.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-textPrimary mb-2">
                  Other High-Confidence Signals
                </h2>
                <div className="space-y-2">
                  {runnersUp.map((s) => (
                    <Link
                      key={s.ticker.symbol}
                      href={`/markets/${s.ticker.symbol}`}
                      className="flex items-center justify-between bg-surface border border-borderc rounded-xl px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <CoinAvatar symbol={s.ticker.baseAsset} size={32} />
                        <div>
                          <p className="text-sm font-semibold text-textPrimary">
                            {s.ticker.baseAsset}
                          </p>
                          <p className="text-[10px] text-textSecondary">
                            ${formatPrice(s.ticker.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-bold ${
                            s.signal.action.includes("BUY")
                              ? "text-secondary"
                              : s.signal.action.includes("SELL")
                              ? "text-danger"
                              : "text-textSecondary"
                          }`}
                        >
                          {s.signal.action.replace("_", " ")}
                        </p>
                        <p className="text-[10px] text-textSecondary">
                          {s.signal.confidence}% confidence
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {lastUpdated && (
              <p className="text-[10px] text-textSecondary text-center">
                Last scanned {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
