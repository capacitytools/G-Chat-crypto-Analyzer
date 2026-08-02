/**
 * lib/storage.ts
 * -----------------------------------------------------------------------
 * localStorage-backed persistence for Watchlist + Community feed.
 * No backend/database — everything lives on-device, per the spec.
 * -----------------------------------------------------------------------
 */

const WATCHLIST_KEY = "gchat_watchlist_v1";
const COMMUNITY_KEY = "gchat_community_posts_v1";
const ADMIN_KEY = "gchat_admin_auth_v1";

/* ------------------------------------------------------------------ */
/* Watchlist                                                            */
/* ------------------------------------------------------------------ */
export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isInWatchlist(symbol: string): boolean {
  return getWatchlist().includes(symbol);
}

export function toggleWatchlist(symbol: string): string[] {
  const current = getWatchlist();
  const next = current.includes(symbol)
    ? current.filter((s) => s !== symbol)
    : [...current, symbol];
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  return next;
}

/* ------------------------------------------------------------------ */
/* Community / Admin announcements                                      */
/* ------------------------------------------------------------------ */
export interface CommunityPost {
  id: string;
  message: string;
  timestamp: number;
  author: string; // e.g. "G-Chat Admin"
}

export function getCommunityPosts(): CommunityPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMMUNITY_KEY);
    const posts: CommunityPost[] = raw ? JSON.parse(raw) : [];
    return posts.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function addCommunityPost(message: string, author = "G-Chat Admin"): CommunityPost[] {
  const posts = getCommunityPosts();
  const newPost: CommunityPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    message,
    timestamp: Date.now(),
    author,
  };
  const next = [newPost, ...posts];
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(next));
  return next;
}

export function deleteCommunityPost(id: string): CommunityPost[] {
  const posts = getCommunityPosts().filter((p) => p.id !== id);
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  return posts;
}

/* ------------------------------------------------------------------ */
/* Admin gate (lightweight, client-side only — no real auth/backend)    */
/* ------------------------------------------------------------------ */
// NOTE: This is intentionally simple since there is no backend. It is a
// convenience gate, not a security boundary — do not use for real secrets.
const ADMIN_PASSCODE = "gchat2026";

export function isAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "true";
}

export function tryAdminUnlock(passcode: string): boolean {
  if (passcode === ADMIN_PASSCODE) {
    sessionStorage.setItem(ADMIN_KEY, "true");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_KEY);
}
