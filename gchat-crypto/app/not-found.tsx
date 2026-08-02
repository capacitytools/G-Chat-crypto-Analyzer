import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-24 text-center">
      <SearchX size={40} color="#8696A0" className="mb-4" />
      <h1 className="text-lg font-semibold text-textPrimary mb-1">
        Page not found
      </h1>
      <p className="text-sm text-textSecondary mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/markets"
        className="bg-primary text-appbg font-semibold text-sm rounded-xl px-5 py-2.5"
      >
        Back to Markets
      </Link>
    </div>
  );
}
