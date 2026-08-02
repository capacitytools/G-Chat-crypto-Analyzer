# G-Chat Crypto Analyzer

A mobile-first PWA combining Binance's data density with WhatsApp's clean dark UI.
No login, no backend, no paid APIs — built with Next.js 14 (App Router), TypeScript,
Tailwind CSS, and `lightweight-charts`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/markets`.

For production:

```bash
npm run build
npm run start
```

## Project Structure

```
app/
  layout.tsx                 Root layout, PWA meta, BottomNav shell
  page.tsx                   Redirects to /markets
  markets/page.tsx            Home dashboard (overview, tabs, coin list)
  markets/[symbol]/page.tsx   Coin detail: chart, AI signal, stats, risk calc
  ai-daily/page.tsx           Scans top 50 coins by volume -> Golden Pick
  signals/page.tsx            Hourly actionable BUY/SELL signals
  watchlist/page.tsx          Saved coins (localStorage)
  community/page.tsx          WhatsApp-style announcement feed
  admin/page.tsx              Hidden passcode-gated admin panel

components/
  BottomNav.tsx     5-tab fixed bottom navigation
  AppHeader.tsx     Header with logo + optional search
  CoinAvatar.tsx    Coin logo with letter-circle fallback
  CoinListRow.tsx   Binance-style list row w/ star toggle
  CoinChart.tsx     Candlestick chart (lightweight-charts)
  SignalCard.tsx    AI verdict card w/ entry/SL/TP/reasoning
  RiskCalculator.tsx  Position sizing calculator
  MarketOverview.tsx  Market cap / BTC dominance / Fear&Greed

lib/
  binance.ts        Binance public REST API wrapper + formatters
  indicators.ts      RSI / EMA / SMA / MACD / Bollinger / ATR + signal engine
  scanner.ts          Concurrent multi-coin scanner for AI Daily Pick & Signals
  storage.ts           localStorage helpers (watchlist, community, admin gate)
```

## Data Sources (all free, no auth)

- **Binance public REST API** — tickers, klines (candles)
- **alternative.me** — Fear & Greed Index
- **CoinGecko public `/global`** — total market cap & BTC dominance (Binance
  doesn't expose these directly)

## AI Signal Engine

`lib/indicators.ts` implements RSI(14), EMA(20/50/200), MACD(12,26,9),
Bollinger Bands(20,2), and ATR(14) from scratch (no external TA library).
`generateSignal()` combines them into a weighted score:

- EMA stack (trend structure): ±25
- RSI oversold/overbought + trend alignment: up to ±45
- RSI momentum vs midline: ±8
- MACD crossover confirmation: ±20 (or ±5 for histogram sign)
- EMA20 short-term bias: ±5

Score buckets into **Strong Buy / Buy / Hold / Sell / Strong Sell**, and ATR
drives risk-managed levels: `SL = entry ∓ 2×ATR`, `TP1 = entry ± 3×ATR`,
`TP2 = entry ± 4×ATR`.

## Admin Access

Visit `/admin` (linked subtly at the bottom of the Community tab). Default
passcode: `gchat2026` (change `ADMIN_PASSCODE` in `lib/storage.ts` before
deploying publicly). This is a client-side convenience gate only — there's no
real backend auth, consistent with the no-login/no-database requirement.

## PWA / Install

`public/manifest.json` is wired up via `app/layout.tsx` metadata. To make it
fully installable, drop `icon-192.png` and `icon-512.png` into `/public`
(referenced in the manifest but not included by default).

## Notes & Rate Limits

- Market list and watchlist poll Binance every 15s; coin detail & chart every
  20s; AI Daily Pick / Signals scans are cached client-side (15 min / 10 min
  TTL respectively) to avoid hammering the API on every visit — use the
  "Refresh" button to force a live rescan.
- The scanner limits concurrency to 6 simultaneous kline requests to stay
  within Binance's public rate limits when scanning 40–50 coins.
- All monetary figures are illustrative; nothing here is financial advice.
