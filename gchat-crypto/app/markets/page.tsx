"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import MarketOverview from "@/components/MarketOverview";
import CoinListRow from "@/components/CoinListRow";
import { getAllUsdtTickers, searchTickers, ParsedTicker } from "@/lib/binance";
import { getWatchlist, toggleWatchlist } from "@/lib/storage";

type TabKey = "trending" | "gainers" | "losers" | "volume";

const TABS: { key: TabKey; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "gainers", label: "Top Gainers" },
  { key: "losers", label: "Top Losers" },
  { key: "volume", label: "Highest Volume" },
];

export default function MarketsPage() {
  const [tickers, setTickers] = useState<ParsedTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("trending");
  const [query, setQuery] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setError(null);
        const data = await getAllUsdtTickers();
        if (mounted) setTickers(data);
      } catch (e) {
        if (mounted) setError("Failed to load market data. Pull down to retry.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000); // refresh every 15s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleWatch = (symbol: string) => {
    const next = toggleWatchlist(symbol);
    setWatchlist(next);
  };

  const filteredList = useMemo(() => {
    let list = tickers;
    if (query.trim()) {
      list = searchTickers(list, query);
    } else {
      switch (activeTab) {
        case "gainers":
          list = [...list].sort((a, b) => b.changePercent - a.changePercent).slice(0, 50);
          break;
        case "losers":
          list = [...list].sort((a, b) => a.changePercent - b.changePercent).slice(0, 50);
          break;
        case "volume":
          list = [...list].sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, 50);
          break;
        case "trending":
        default:
          // "Trending" = highest absolute momentum, weighted toward volume
          list = [...list]
            .sort(
              (a, b) =>
                Math.abs(b.changePercent) * Math.log(b.quoteVolume + 1) -
                Math.abs(a.changePercent) * Math.log(a.quoteVolume + 1)
            )
            .slice(0, 50);
          break;
      }
    }
    return list;
  }, [tickers, activeTab, query]);

  return (
    <div>
      <AppHeader
        showSearch
        searchValue={query}
        onSearchChange={setQuery}
      />

      <MarketOverview />

      {!query.trim() && (
        <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-appbg border-primary"
                  : "bg-surface text-textSecondary border-borderc"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2">
        {loading && (
          <div className="px-4 py-8 text-center text-textSecondary text-sm">
            Loading live market data…
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-8 text-center text-danger text-sm">{error}</div>
        )}

        {!loading && !error && filteredList.length === 0 && (
          <div className="px-4 py-8 text-center text-textSecondary text-sm">
            No coins found.
          </div>
        )}

        {!loading &&
          !error &&
          filteredList.map((t) => (
            <CoinListRow
              key={t.symbol}
              ticker={t}
              isWatched={watchlist.includes(t.symbol)}
              onToggleWatch={handleToggleWatch}
            />
          ))}
      </div>
    </div>
  );
}
