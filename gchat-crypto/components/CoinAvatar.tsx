"use client";

import { useState } from "react";

// Deterministic color assignment based on the first character, so each
// coin gets a consistent, distinct avatar color across the app.
const PALETTE = [
  "#00A884",
  "#25D366",
  "#F6465D",
  "#8B5CF6",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#14B8A6",
];

function colorForSymbol(symbol: string): string {
  const code = symbol.charCodeAt(0) || 0;
  return PALETTE[code % PALETTE.length];
}

interface CoinAvatarProps {
  symbol: string; // base asset, e.g. "BTC"
  size?: number;
  logoUrl?: string;
}

export default function CoinAvatar({ symbol, size = 36, logoUrl }: CoinAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const letter = symbol?.charAt(0)?.toUpperCase() ?? "?";
  const bg = colorForSymbol(symbol ?? "X");

  if (logoUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={symbol}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: "#0B141A",
        fontSize: size * 0.42,
      }}
    >
      {letter}
    </div>
  );
}
