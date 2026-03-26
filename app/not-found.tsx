// app/not-found.tsx
import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">⚽</div>
      <h1 className="font-display text-4xl font-bold text-white mb-3">
        Off the pitch
      </h1>
      <p className="text-neutral-400 text-lg max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-grass-gradient text-pitch-950 font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/fixtures"
          className="flex items-center gap-2 px-5 py-2.5 bg-pitch-700 border border-neutral-600 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors"
        >
          <Search className="w-4 h-4" />
          Browse Fixtures
        </Link>
      </div>
    </div>
  );
}
