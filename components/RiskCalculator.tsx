"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

interface RiskCalculatorProps {
  defaultEntry?: number;
  defaultStopLoss?: number;
}

export default function RiskCalculator({
  defaultEntry,
  defaultStopLoss,
}: RiskCalculatorProps) {
  const [balance, setBalance] = useState("1000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [entry, setEntry] = useState(defaultEntry ? String(defaultEntry) : "");
  const [stopLoss, setStopLoss] = useState(
    defaultStopLoss ? String(defaultStopLoss) : ""
  );

  const result = useMemo(() => {
    const bal = parseFloat(balance);
    const riskPct = parseFloat(riskPercent);
    const entryPrice = parseFloat(entry);
    const stopPrice = parseFloat(stopLoss);

    if (
      !isFinite(bal) ||
      !isFinite(riskPct) ||
      !isFinite(entryPrice) ||
      !isFinite(stopPrice) ||
      entryPrice === stopPrice ||
      bal <= 0 ||
      riskPct <= 0
    ) {
      return null;
    }

    const riskAmount = bal * (riskPct / 100);
    const priceDelta = Math.abs(entryPrice - stopPrice);
    const positionSizeUnits = riskAmount / priceDelta;
    const positionValueUsd = positionSizeUnits * entryPrice;
    const leverageNeeded = positionValueUsd / bal;

    return {
      riskAmount,
      positionSizeUnits,
      positionValueUsd,
      leverageNeeded,
    };
  }, [balance, riskPercent, entry, stopLoss]);

  return (
    <div className="bg-surface rounded-xl border border-borderc p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} color="#00A884" />
        <h3 className="text-sm font-semibold text-textPrimary">
          Position Size Calculator
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-textSecondary mb-1 block">
            Account Balance ($)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full bg-appbg border border-borderc rounded-lg px-2.5 py-2 text-sm text-textPrimary outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[10px] text-textSecondary mb-1 block">
            Risk per Trade (%)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full bg-appbg border border-borderc rounded-lg px-2.5 py-2 text-sm text-textPrimary outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[10px] text-textSecondary mb-1 block">
            Entry Price ($)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-appbg border border-borderc rounded-lg px-2.5 py-2 text-sm text-textPrimary outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[10px] text-textSecondary mb-1 block">
            Stop Loss ($)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full bg-appbg border border-borderc rounded-lg px-2.5 py-2 text-sm text-textPrimary outline-none focus:border-primary"
          />
        </div>
      </div>

      {result ? (
        <div className="bg-appbg rounded-lg p-3 space-y-1.5 border border-borderc">
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary">Risk Amount</span>
            <span className="text-textPrimary font-medium">
              ${result.riskAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary">Position Size (units)</span>
            <span className="text-textPrimary font-medium">
              {result.positionSizeUnits.toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary">Position Value</span>
            <span className="text-primary font-semibold">
              ${result.positionValueUsd.toFixed(2)}
            </span>
          </div>
          {result.leverageNeeded > 1 && (
            <div className="flex justify-between text-xs">
              <span className="text-textSecondary">Implied Leverage</span>
              <span className="text-textPrimary font-medium">
                {result.leverageNeeded.toFixed(2)}x
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-textSecondary text-center py-2">
          Enter valid values to calculate position size.
        </p>
      )}
    </div>
  );
}
