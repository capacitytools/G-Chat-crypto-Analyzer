"use client";

import { Search, MessageSquareText } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export default function AppHeader({
  title = "G-Chat Crypto Analyzer",
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search coin (e.g. BTC)",
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surfaceAlt border-b border-borderc safe-top">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
          <MessageSquareText size={18} color="#0B141A" strokeWidth={2.4} />
        </div>
        <h1 className="text-[15px] font-semibold text-textPrimary truncate">
          {title}
        </h1>
      </div>
      {showSearch && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2.5 border border-borderc">
            <Search size={18} color="#8696A0" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent outline-none text-sm text-textPrimary placeholder:text-textSecondary flex-1"
            />
          </div>
        </div>
      )}
    </header>
  );
}
