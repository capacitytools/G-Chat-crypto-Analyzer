"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Lock, Send, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  isAdminUnlocked,
  tryAdminUnlock,
  adminLogout,
  getCommunityPosts,
  addCommunityPost,
  deleteCommunityPost,
  CommunityPost,
} from "@/lib/storage";

export default function AdminPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passError, setPassError] = useState(false);
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    setUnlocked(isAdminUnlocked());
  }, []);

  useEffect(() => {
    if (unlocked) setPosts(getCommunityPosts());
  }, [unlocked]);

  const handleUnlock = () => {
    if (tryAdminUnlock(passcode)) {
      setUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handlePost = () => {
    if (!message.trim()) return;
    const next = addCommunityPost(message.trim());
    setPosts(next);
    setMessage("");
  };

  const handleDelete = (id: string) => {
    setPosts(deleteCommunityPost(id));
  };

  const handleLogout = () => {
    adminLogout();
    setUnlocked(false);
  };

  return (
    <div>
      <header className="sticky top-0 z-40 bg-surfaceAlt border-b border-borderc safe-top">
        <div className="flex items-center gap-2 px-3 py-3">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ChevronLeft size={22} color="#E9EDEF" />
          </button>
          <h1 className="text-sm font-semibold text-textPrimary flex-1">
            Admin Panel
          </h1>
          {unlocked && (
            <button onClick={handleLogout} className="p-1 text-textSecondary">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {!unlocked ? (
        <div className="px-4 pt-16 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-surface border border-borderc flex items-center justify-center mb-4">
            <Lock size={24} color="#00A884" />
          </div>
          <p className="text-sm text-textSecondary mb-4 text-center">
            Enter the admin passcode to manage community announcements.
          </p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setPassError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Passcode"
            className="w-full max-w-xs bg-surface border border-borderc rounded-xl px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary text-center"
          />
          {passError && (
            <p className="text-xs text-danger mt-2">Incorrect passcode.</p>
          )}
          <button
            onClick={handleUnlock}
            className="mt-4 w-full max-w-xs bg-primary text-appbg font-semibold text-sm rounded-xl py-3"
          >
            Unlock
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 pb-6 space-y-4">
          <div className="bg-surface rounded-xl border border-borderc p-3">
            <label className="text-xs text-textSecondary mb-2 block">
              New Announcement
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. BTC looking bullish today! Watch the $65K resistance level."
              rows={4}
              className="w-full bg-appbg border border-borderc rounded-lg px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-primary resize-none"
            />
            <button
              onClick={handlePost}
              disabled={!message.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-appbg font-semibold text-sm rounded-xl py-2.5 disabled:opacity-40"
            >
              <Send size={15} />
              Post Announcement
            </button>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-textPrimary mb-2">
              Posted Announcements ({posts.length})
            </h2>
            <div className="space-y-2">
              {posts.length === 0 && (
                <p className="text-xs text-textSecondary text-center py-6">
                  No announcements posted yet.
                </p>
              )}
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface border border-borderc rounded-xl p-3 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-textPrimary whitespace-pre-wrap">
                      {post.message}
                    </p>
                    <p className="text-[10px] text-textSecondary mt-1">
                      {new Date(post.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="shrink-0 p-1.5 text-danger"
                    aria-label="Delete post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
