/**
 * lib/scanner.ts
 * -----------------------------------------------------------------------
 * Scans a batch of coins, running the AI signal engine on each, and
 * returns ranked results. Powers both "AI Daily Pick" (top 50 by volume,
 * best Strong Buy) and "Hourly Signals" (all actionable BUY/SELL signals).
 * -----------------------------------------------------------------------
 */
import { getAllUsdtTickers, getKlines, ParsedTicker } from "./binance";
import { generateSignal, SignalResult } from "./indicators";

export interface ScannedCoin {
  ticker: ParsedTicker;
  signal: SignalResult;
}

/**
 * Fetch klines + generate signal for a list of tickers, with limited
 * concurrency to stay polite to Binance's public rate limits.
 */
async function scanTickers(
  tickers: ParsedTicker[],
  interval: string,
  concurrency = 6
): Promise<ScannedCoin[]> {
  const results: ScannedCoin[] = [];
  let index = 0;

  async function worker() {
    while (index < tickers.length) {
      const current = tickers[index];
      index++;
      try {
        const klines = await getKlines(current.symbol, interval, 300);
        const signal = generateSignal(klines);
        if (signal) {
          results.push({ ticker: current, signal });
        }
      } catch {
        // Skip coins that fail to fetch (e.g. delisted/thin pairs)
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Scan the top N coins by 24h quote volume and return them ranked by
 * signal confidence score, highest first. Used for AI Daily Pick.
 */
export async function scanTopVolumeCoins(
  topN = 50,
  interval = "1h"
): Promise<ScannedCoin[]> {
  const allTickers = await getAllUsdtTickers();
  const top = allTickers.slice(0, topN);
  const scanned = await scanTickers(top, interval);

  return scanned.sort((a, b) => {
    // Rank Strong Buy/Sell highest, then by confidence
    const weight = (s: SignalResult) => {
      if (s.action === "STRONG_BUY") return 2;
      if (s.action === "STRONG_SELL") return 1;
      return 0;
    };
    const wA = weight(a.signal);
    const wB = weight(b.signal);
    if (wA !== wB) return wB - wA;
    return b.signal.confidence - a.signal.confidence;
  });
}

/** Returns only actionable (non-HOLD) signals, sorted by confidence. */
export function filterActionable(scanned: ScannedCoin[]): ScannedCoin[] {
  return scanned
    .filter((s) => s.signal.action !== "HOLD")
    .sort((a, b) => b.signal.confidence - a.signal.confidence);
}
