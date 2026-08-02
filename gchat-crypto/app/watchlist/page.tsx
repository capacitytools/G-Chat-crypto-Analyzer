"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import CoinListRow from "@/components/CoinListRow";
import { getAllUsdtTickers, ParsedTicker } from "@/lib/binance";
import { getWatchlist, toggleWatchlist } from "@/lib/storage";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [tickers, setTickers] = useState<ParsedTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setError(null);
        const all = await getAllUsdtTickers();
        if (mounted) setTickers(all);
      } catch {
        if (mounted) setError("Failed to load prices. Pull down to retry.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleWatch = (symbol: string) => {
    const next = toggleWatchlist(symbol);
    setWatchlist(next);
  };

  const watchedTickers = tickers.filter((t) => watchlist.includes(t.symbol));

  return (
    <div>
      <AppHeader title="Watchlist" />

      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-textSecondary">
          {watchlist.length} coin{watchlist.length === 1 ? "" : "s"} saved
        </p>
      </div>

      {loading && (
        <div className="px-4 py-10 text-center text-textSecondary text-sm">
          Loading your watchlist…
        </div>
      )}

      {error && !loading && (
        <div className="px-4 py-10 text-center text-danger text-sm">{error}</div>
      )}

      {!loading && !error && watchlist.length === 0 && (
        <div className="px-4 py-16 text-center">
          <Star size={36} color="#8696A0" className="mx-auto mb-3" />
          <p className="text-sm text-textSecondary">
            Your watchlist is empty.
          </p>
          <p className="text-xs text-textSecondary mt-1">
            Tap the star icon on any coin in Markets to save it here.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        watchedTickers.map((t) => (
          <CoinListRow
            key={t.symbol}
            ticker={t}
            isWatched={true}
            onToggleWatch={handleToggleWatch}
          />
        ))}
    </div>
  );
}
