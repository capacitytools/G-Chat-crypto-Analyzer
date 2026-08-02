/**
 * lib/indicators.ts
 * -----------------------------------------------------------------------
 * A dependency-free technical analysis math engine.
 * All functions operate on plain number[] arrays (closes, highs, lows)
 * ordered OLDEST -> NEWEST, which matches Binance kline API order.
 * -----------------------------------------------------------------------
 */

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

/* ------------------------------------------------------------------ */
/* EMA - Exponential Moving Average                                    */
/* ------------------------------------------------------------------ */
export function EMA(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  // Seed the first EMA value with a simple average of the first `period` values
  let emaPrev = values.slice(0, period).reduce((a, b) => a + b, 0) / Math.min(period, values.length);
  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      // Not enough data yet for a true EMA; carry the seed value forward
      result.push(emaPrev);
      continue;
    }
    emaPrev = values[i] * k + emaPrev * (1 - k);
    result.push(emaPrev);
  }
  return result;
}

/** Convenience: return only the latest EMA value for a given period */
export function latestEMA(values: number[], period: number): number {
  const series = EMA(values, period);
  return series[series.length - 1] ?? NaN;
}

/* ------------------------------------------------------------------ */
/* SMA - Simple Moving Average                                         */
/* ------------------------------------------------------------------ */
export function SMA(values: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* RSI - Relative Strength Index (Wilder's smoothing)                  */
/* ------------------------------------------------------------------ */
export function RSI(closes: number[], period = 14): number[] {
  const result: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    // Wilder's smoothing
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  }

  return result;
}

export function latestRSI(closes: number[], period = 14): number {
  const series = RSI(closes, period);
  return series[series.length - 1];
}

/* ------------------------------------------------------------------ */
/* MACD - Moving Average Convergence Divergence                        */
/* ------------------------------------------------------------------ */
export interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

export function MACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  const emaFast = EMA(closes, fastPeriod);
  const emaSlow = EMA(closes, slowPeriod);
  const macdLine = closes.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = EMA(macdLine, signalPeriod);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

/* ------------------------------------------------------------------ */
/* Bollinger Bands                                                     */
/* ------------------------------------------------------------------ */
export interface BollingerBands {
  upper: number[];
  middle: number[];
  lower: number[];
}

export function bollingerBands(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2
): BollingerBands {
  const middle = SMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = middle[i];
    const variance =
      slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push(mean + stdDevMultiplier * stdDev);
    lower.push(mean - stdDevMultiplier * stdDev);
  }

  return { upper, middle, lower };
}

/* ------------------------------------------------------------------ */
/* ATR - Average True Range (Wilder's smoothing)                       */
/* ------------------------------------------------------------------ */
export function ATR(highs: number[], lows: number[], closes: number[], period = 14): number[] {
  const trueRanges: number[] = [];
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      trueRanges.push(highs[i] - lows[i]);
      continue;
    }
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  const result: number[] = new Array(trueRanges.length).fill(NaN);
  if (trueRanges.length < period) return result;

  let atrPrev =
    trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result[period - 1] = atrPrev;

  for (let i = period; i < trueRanges.length; i++) {
    atrPrev = (atrPrev * (period - 1) + trueRanges[i]) / period;
    result[i] = atrPrev;
  }

  return result;
}

export function latestATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): number {
  const series = ATR(highs, lows, closes, period);
  return series[series.length - 1];
}

/* ------------------------------------------------------------------ */
/* AI SIGNAL ENGINE                                                     */
/* ------------------------------------------------------------------ */
export type SignalAction =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface SignalResult {
  action: SignalAction;
  confidence: number; // 0-100
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  reasons: string[];
  indicators: {
    rsi: number;
    macdHistogram: number;
    ema20: number;
    ema50: number;
    ema200: number;
    atr: number;
    price: number;
  };
}

/**
 * Core AI signal engine. Combines RSI, EMA trend structure, and MACD
 * crossover confirmation into a weighted confidence score, then derives
 * risk-managed entry/stop/target levels using ATR.
 */
export function generateSignal(klines: Kline[]): SignalResult | null {
  if (klines.length < 210) {
    // Not enough history for EMA200; engine needs a reasonable lookback
    return null;
  }

  const closes = klines.map((k) => k.close);
  const highs = klines.map((k) => k.high);
  const lows = klines.map((k) => k.low);

  const price = closes[closes.length - 1];

  const rsiSeries = RSI(closes, 14);
  const rsi = rsiSeries[rsiSeries.length - 1];
  const prevRsi = rsiSeries[rsiSeries.length - 2];

  const ema20 = latestEMA(closes, 20);
  const ema50 = latestEMA(closes, 50);
  const ema200 = latestEMA(closes, 200);

  const { macdLine, signalLine, histogram } = MACD(closes);
  const macdHist = histogram[histogram.length - 1];
  const prevMacdHist = histogram[histogram.length - 2];
  const macdBullishCross = prevMacdHist <= 0 && macdHist > 0;
  const macdBearishCross = prevMacdHist >= 0 && macdHist < 0;

  const atr = latestATR(highs, lows, closes, 14);

  const reasons: string[] = [];
  let score = 0; // -100 (strong sell) to +100 (strong buy)

  /* --- Trend structure (EMA stack) --- */
  const bullTrend = price > ema50 && ema50 > ema200;
  const bearTrend = price < ema50 && ema50 < ema200;
  if (bullTrend) {
    score += 25;
    reasons.push("Price above EMA50 and EMA50 above EMA200 (bullish trend structure)");
  } else if (bearTrend) {
    score -= 25;
    reasons.push("Price below EMA50 and EMA50 below EMA200 (bearish trend structure)");
  }

  /* --- RSI mean-reversion / momentum --- */
  if (rsi < 30) {
    score += 30;
    reasons.push(`RSI oversold at ${rsi.toFixed(1)}`);
    if (price > ema50) {
      score += 15;
      reasons.push("Oversold RSI while price holds above EMA50 — high-probability reversal setup");
    }
  } else if (rsi > 70) {
    score -= 30;
    reasons.push(`RSI overbought at ${rsi.toFixed(1)}`);
    if (price < ema50) {
      score -= 15;
      reasons.push("Overbought RSI while price stays below EMA50 — high-probability rejection setup");
    }
  } else if (rsi > 50 && rsi > prevRsi) {
    score += 8;
    reasons.push("RSI rising above midline, momentum building bullish");
  } else if (rsi < 50 && rsi < prevRsi) {
    score -= 8;
    reasons.push("RSI falling below midline, momentum building bearish");
  }

  /* --- MACD confirmation --- */
  if (macdBullishCross) {
    score += 20;
    reasons.push("MACD bullish crossover confirms momentum shift up");
  } else if (macdBearishCross) {
    score -= 20;
    reasons.push("MACD bearish crossover confirms momentum shift down");
  } else if (macdHist > 0) {
    score += 5;
  } else if (macdHist < 0) {
    score -= 5;
  }

  /* --- EMA20 short-term confirmation --- */
  if (price > ema20) score += 5;
  else score -= 5;

  // Clamp score
  score = Math.max(-100, Math.min(100, score));
  const confidence = Math.min(100, Math.round(Math.abs(score)));

  let action: SignalAction = "HOLD";
  if (score >= 55) action = "STRONG_BUY";
  else if (score >= 20) action = "BUY";
  else if (score <= -55) action = "STRONG_SELL";
  else if (score <= -20) action = "SELL";

  const isBuySide = action === "STRONG_BUY" || action === "BUY";
  const isSellSide = action === "STRONG_SELL" || action === "SELL";

  const entry = price;
  let stopLoss = entry;
  let takeProfit1 = entry;
  let takeProfit2 = entry;

  const safeAtr = isFinite(atr) && atr > 0 ? atr : entry * 0.01;

  if (isBuySide) {
    stopLoss = entry - 2 * safeAtr;
    takeProfit1 = entry + 3 * safeAtr;
    takeProfit2 = entry + 4 * safeAtr;
  } else if (isSellSide) {
    stopLoss = entry + 2 * safeAtr;
    takeProfit1 = entry - 3 * safeAtr;
    takeProfit2 = entry - 4 * safeAtr;
  } else {
    // HOLD: still show a neutral symmetric reference using ATR
    stopLoss = entry - 2 * safeAtr;
    takeProfit1 = entry + 3 * safeAtr;
    takeProfit2 = entry + 4 * safeAtr;
  }

  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit1 - entry);
  const riskRewardRatio = risk > 0 ? reward / risk : 0;

  return {
    action,
    confidence,
    entry,
    stopLoss,
    takeProfit1,
    takeProfit2,
    riskRewardRatio,
    reasons,
    indicators: {
      rsi,
      macdHistogram: macdHist,
      ema20,
      ema50,
      ema200,
      atr: safeAtr,
      price,
    },
  };
}
