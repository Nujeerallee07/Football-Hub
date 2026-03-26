// app/error.tsx
"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-6">🟥</div>
      <h2 className="font-display text-3xl font-bold text-white mb-3">
        Something went wrong
      </h2>
      <p className="text-neutral-400 max-w-sm mb-8">
        There was an error loading this page. This might be a temporary issue
        with our data provider.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-grass-gradient text-pitch-950 font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-pitch-700 border border-neutral-600 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  );
}
