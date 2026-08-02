/**
 * lib/binance.ts
 * -----------------------------------------------------------------------
 * Thin, typed wrapper around Binance's public REST API (no auth required).
 * Docs: https://binance-docs.github.io/apidocs/spot/en/
 * -----------------------------------------------------------------------
 */
import { Kline } from "./indicators";

const BASE_URL = "https://api.binance.com/api/v3";

export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  lastQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  count: number;
}

export interface ParsedTicker {
  symbol: string;
  baseAsset: string;
  price: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  quoteVolume: number;
}

/** Strip the "USDT" quote suffix to get a display-friendly base asset name */
export function baseAssetFromSymbol(symbol: string): string {
  return symbol.replace(/USDT$/, "");
}

function parseTicker(t: Ticker24hr): ParsedTicker {
  return {
    symbol: t.symbol,
    baseAsset: baseAssetFromSymbol(t.symbol),
    price: parseFloat(t.lastPrice),
    changePercent: parseFloat(t.priceChangePercent),
    high24h: parseFloat(t.highPrice),
    low24h: parseFloat(t.lowPrice),
    volume: parseFloat(t.volume),
    quoteVolume: parseFloat(t.quoteVolume),
  };
}

/**
 * Fetch 24hr ticker stats for ALL USDT pairs, sorted by quote volume desc.
 * This single endpoint powers Markets, Gainers/Losers, and the coin scanner.
 */
export async function getAllUsdtTickers(): Promise<ParsedTicker[]> {
  const res = await fetch(`${BASE_URL}/ticker/24hr`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error(`Binance ticker fetch failed: ${res.status}`);
  const data: Ticker24hr[] = await res.json();

  return data
    .filter(
      (t) =>
        t.symbol.endsWith("USDT") &&
        !t.symbol.includes("UPUSDT") &&
        !t.symbol.includes("DOWNUSDT") &&
        !t.symbol.includes("BEARUSDT") &&
        !t.symbol.includes("BULLUSDT")
    )
    .map(parseTicker)
    .sort((a, b) => b.quoteVolume - a.quoteVolume);
}

export async function getTicker(symbol: string): Promise<ParsedTicker> {
  const res = await fetch(`${BASE_URL}/ticker/24hr?symbol=${symbol}`, {
    next: { revalidate: 5 },
  });
  if (!res.ok) throw new Error(`Binance ticker fetch failed: ${res.status}`);
  const data: Ticker24hr = await res.json();
  return parseTicker(data);
}

/**
 * Fetch candlestick (kline) data.
 * interval examples: 1m, 5m, 15m, 1h, 4h, 1d
 */
export async function getKlines(
  symbol: string,
  interval: string = "1h",
  limit: number = 300
): Promise<Kline[]> {
  const res = await fetch(
    `${BASE_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    { next: { revalidate: 15 } }
  );
  if (!res.ok) throw new Error(`Binance klines fetch failed: ${res.status}`);
  const raw: unknown[][] = await res.json();

  return raw.map((k) => ({
    openTime: k[0] as number,
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
    closeTime: k[6] as number,
  }));
}

/** Simple search across a ticker list by symbol / base asset name */
export function searchTickers(
  tickers: ParsedTicker[],
  query: string
): ParsedTicker[] {
  const q = query.trim().toUpperCase();
  if (!q) return tickers;
  return tickers.filter(
    (t) => t.baseAsset.includes(q) || t.symbol.includes(q)
  );
}

/* ------------------------------------------------------------------ */
/* Fear & Greed Index (alternative.me — free, no auth)                 */
/* ------------------------------------------------------------------ */
export interface FearGreedData {
  value: number;
  classification: string;
}

export async function getFearGreedIndex(): Promise<FearGreedData | null> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const entry = json?.data?.[0];
    if (!entry) return null;
    return {
      value: parseInt(entry.value, 10),
      classification: entry.value_classification,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Global market stats (CoinGecko free tier — no auth, used only for   */
/* total market cap + BTC dominance, which Binance doesn't expose)     */
/* ------------------------------------------------------------------ */
export interface GlobalMarketData {
  totalMarketCapUsd: number;
  btcDominance: number;
  marketCapChangePercent24h: number;
}

export async function getGlobalMarketData(): Promise<GlobalMarketData | null> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;
    return {
      totalMarketCapUsd: d.total_market_cap?.usd ?? 0,
      btcDominance: d.market_cap_percentage?.btc ?? 0,
      marketCapChangePercent24h: d.market_cap_change_percentage_24h_usd ?? 0,
    };
  } catch {
    return null;
  }
}

/** Format large numbers into compact form: 1.2B, 3.4M, etc. */
export function formatCompactNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
}

/** Format price with sensible decimal precision based on magnitude */
export function formatPrice(price: number): string {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.01) return price.toFixed(6);
  return price.toFixed(8);
}
