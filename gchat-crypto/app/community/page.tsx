"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Shield } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { getCommunityPosts, CommunityPost } from "@/lib/storage";

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} · ${time}`;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    setPosts(getCommunityPosts());
    // Refresh periodically in case admin posts in another tab
    const interval = setInterval(() => setPosts(getCommunityPosts()), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <AppHeader title="Community" />

      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-textSecondary text-xs">
          <MessageCircle size={13} color="#00A884" />
          <span>Official G-Chat announcements</span>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1 text-[10px] text-textSecondary/70"
        >
          <Shield size={11} />
          Admin
        </Link>
      </div>

      <div className="px-4 py-4 space-y-3">
        {posts.length === 0 && (
          <div className="py-16 text-center">
            <MessageCircle size={36} color="#8696A0" className="mx-auto mb-3" />
            <p className="text-sm text-textSecondary">No announcements yet.</p>
            <p className="text-xs text-textSecondary mt-1">
              Check back soon for market updates from the team.
            </p>
          </div>
        )}

        {posts.map((post) => (
          <div key={post.id} className="flex justify-start">
            <div className="max-w-[85%] bg-surface border border-borderc rounded-xl rounded-tl-sm px-3.5 py-2.5">
              <p className="text-xs font-semibold text-primary mb-1">
                {post.author}
              </p>
              <p className="text-sm text-textPrimary whitespace-pre-wrap leading-relaxed">
                {post.message}
              </p>
              <p className="text-[10px] text-textSecondary mt-1.5 text-right">
                {formatTimestamp(post.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
