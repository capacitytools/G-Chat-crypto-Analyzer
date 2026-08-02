"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  ColorType,
  UTCTimestamp,
} from "lightweight-charts";
import { getKlines } from "@/lib/binance";

const INTERVALS = [
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
];

interface CoinChartProps {
  symbol: string;
}

export default function CoinChart({ symbol }: CoinChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [interval, setInterval_] = useState("1h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1F2C34" },
        textColor: "#8696A0",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "#222D34" },
        horzLines: { color: "#222D34" },
      },
      rightPriceScale: {
        borderColor: "#222D34",
      },
      timeScale: {
        borderColor: "#222D34",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#8696A0", width: 1, style: 2 },
        horzLine: { color: "#8696A0", width: 1, style: 2 },
      },
      width: containerRef.current.clientWidth,
      height: 320,
    });

    const series = chart.addCandlestickSeries({
      upColor: "#25D366",
      downColor: "#F6465D",
      borderUpColor: "#25D366",
      borderDownColor: "#F6465D",
      wickUpColor: "#25D366",
      wickDownColor: "#F6465D",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Load data whenever symbol or interval changes
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const klines = await getKlines(symbol, interval, 300);
        if (!mounted || !seriesRef.current) return;

        const candles: CandlestickData[] = klines.map((k) => ({
          time: Math.floor(k.openTime / 1000) as UTCTimestamp,
          open: k.open,
          high: k.high,
          low: k.low,
          close: k.close,
        }));

        seriesRef.current.setData(candles);
        chartRef.current?.timeScale().fitContent();
      } catch (e) {
        if (mounted) setError("Unable to load chart data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const poll = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, [symbol, interval]);

  return (
    <div className="bg-surface rounded-xl border border-borderc overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        {INTERVALS.map((i) => (
          <button
            key={i.value}
            onClick={() => setInterval_(i.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              interval === i.value
                ? "bg-primary text-appbg"
                : "text-textSecondary bg-appbg/40"
            }`}
          >
            {i.label}
          </button>
        ))}
        {loading && (
          <span className="text-[10px] text-textSecondary ml-auto">Updating…</span>
        )}
      </div>
      <div ref={containerRef} className="w-full" style={{ height: 320 }} />
      {error && (
        <div className="px-3 pb-3 text-xs text-danger">{error}</div>
      )}
    </div>
  );
}
