"use client";

import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SignalResult } from "@/lib/indicators";
import { formatPrice } from "@/lib/binance";

interface SignalCardProps {
  signal: SignalResult;
  symbol?: string;
  compact?: boolean;
}

const ACTION_CONFIG: Record<
  SignalResult["action"],
  { label: string; color: string; bg: string; Icon: typeof TrendingUp }
> = {
  STRONG_BUY: { label: "Strong Buy", color: "#25D366", bg: "rgba(37,211,102,0.12)", Icon: TrendingUp },
  BUY: { label: "Buy", color: "#00A884", bg: "rgba(0,168,132,0.12)", Icon: TrendingUp },
  HOLD: { label: "Hold", color: "#8696A0", bg: "rgba(134,150,160,0.12)", Icon: Minus },
  SELL: { label: "Sell", color: "#F6465D", bg: "rgba(246,70,93,0.10)", Icon: TrendingDown },
  STRONG_SELL: { label: "Strong Sell", color: "#F6465D", bg: "rgba(246,70,93,0.16)", Icon: TrendingDown },
};

export default function SignalCard({ signal, symbol, compact = false }: SignalCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const config = ACTION_CONFIG[signal.action];
  const { Icon } = config;
  const isBuySide = signal.action === "STRONG_BUY" || signal.action === "BUY";
  const isSellSide = signal.action === "STRONG_SELL" || signal.action === "SELL";

  return (
    <div className="bg-surface rounded-xl border border-borderc overflow-hidden">
      {/* Verdict header */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: config.bg }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: config.color + "22" }}
          >
            <Icon size={20} color={config.color} />
          </div>
          <div>
            {symbol && <p className="text-xs text-textSecondary">{symbol}</p>}
            <p className="text-base font-bold" style={{ color: config.color }}>
              {config.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-textSecondary">Confidence</p>
          <p className="text-lg font-bold text-textPrimary">{signal.confidence}%</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="h-1 bg-borderc">
        <div
          className="h-full transition-all"
          style={{ width: `${signal.confidence}%`, backgroundColor: config.color }}
        />
      </div>

      {compact && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-textSecondary"
        >
          {expanded ? "Hide details" : "Show trade plan"}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {expanded && (
        <>
          {/* Trade plan grid */}
          <div className="grid grid-cols-2 gap-px bg-borderc">
            <div className="bg-surface p-3">
              <p className="text-[10px] text-textSecondary mb-0.5">Entry Price</p>
              <p className="text-sm font-semibold text-textPrimary">
                ${formatPrice(signal.entry)}
              </p>
            </div>
            <div className="bg-surface p-3">
              <p className="text-[10px] text-textSecondary mb-0.5">Stop Loss</p>
              <p className="text-sm font-semibold text-danger">
                ${formatPrice(signal.stopLoss)}
              </p>
            </div>
            <div className="bg-surface p-3">
              <p className="text-[10px] text-textSecondary mb-0.5">Take Profit 1</p>
              <p className="text-sm font-semibold text-secondary">
                ${formatPrice(signal.takeProfit1)}
              </p>
            </div>
            <div className="bg-surface p-3">
              <p className="text-[10px] text-textSecondary mb-0.5">Take Profit 2</p>
              <p className="text-sm font-semibold text-secondary">
                ${formatPrice(signal.takeProfit2)}
              </p>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center justify-between border-t border-borderc">
            <span className="text-xs text-textSecondary">Risk / Reward Ratio</span>
            <span className="text-sm font-semibold text-textPrimary">
              1 : {signal.riskRewardRatio.toFixed(2)}
            </span>
          </div>

          {/* Reasoning */}
          {signal.reasons.length > 0 && (
            <div className="px-4 pb-4 pt-1">
              <p className="text-[10px] text-textSecondary mb-1.5 uppercase tracking-wide">
                AI Reasoning
              </p>
              <ul className="space-y-1">
                {signal.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-textPrimary/90 flex gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw indicators */}
          <div className="grid grid-cols-3 gap-px bg-borderc border-t border-borderc">
            <div className="bg-surfaceAlt p-2.5 text-center">
              <p className="text-[9px] text-textSecondary">RSI(14)</p>
              <p className="text-xs font-semibold text-textPrimary">
                {signal.indicators.rsi.toFixed(1)}
              </p>
            </div>
            <div className="bg-surfaceAlt p-2.5 text-center">
              <p className="text-[9px] text-textSecondary">MACD Hist</p>
              <p
                className={`text-xs font-semibold ${
                  signal.indicators.macdHistogram >= 0 ? "text-secondary" : "text-danger"
                }`}
              >
                {signal.indicators.macdHistogram.toFixed(4)}
              </p>
            </div>
            <div className="bg-surfaceAlt p-2.5 text-center">
              <p className="text-[9px] text-textSecondary">ATR(14)</p>
              <p className="text-xs font-semibold text-textPrimary">
                {formatPrice(signal.indicators.atr)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
