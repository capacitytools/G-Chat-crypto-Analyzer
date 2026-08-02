"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, Sparkles, Radio, Star, MessageCircle } from "lucide-react";

const TABS = [
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/ai-daily", label: "AI Pick", icon: Sparkles },
  { href: "/signals", label: "Signals", icon: Radio },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/community", label: "Community", icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg safe-bottom bg-surfaceAlt border-t border-borderc">
      <div className="flex items-stretch justify-between px-1">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/markets" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                color={active ? "#00A884" : "#8696A0"}
              />
              <span
                className={`text-[10px] ${
                  active ? "text-primary font-semibold" : "text-textSecondary"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
