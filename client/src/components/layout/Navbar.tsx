import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Star, Home, Trophy, Calendar, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchStore, useFavouritesStore } from "@/lib/store";
import { useSearch } from "@/hooks/useFootball";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/premier-league", label: "Premier League", icon: Trophy },
  { href: "/champions-league", label: "UCL", icon: Zap },
  { href: "/fixtures", label: "Fixtures", icon: Calendar },
  { href: "/odds", label: "Odds", icon: TrendingUp },
  { href: "/teams", label: "Teams", icon: Users },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen, openSearch, closeSearch, query, setQuery } = useSearchStore();
  const { favourites } = useFavouritesStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); isOpen ? closeSearch() : openSearch(); }
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, openSearch, closeSearch]);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-pitch-900/95 backdrop-blur-md border-b border-neutral-700/50 shadow-lg" : "bg-pitch-900/80 backdrop-blur-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-grass-gradient flex items-center justify-center shadow-glow-green">
                <Zap className="w-4 h-4 text-pitch-950 fill-pitch-950" />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                Football<span className="text-grass-400">Live</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.href ? "bg-pitch-700 text-white" : "text-neutral-300 hover:text-white hover:bg-pitch-800"
                  )}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={openSearch} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pitch-800 hover:bg-pitch-700 border border-neutral-700/50 text-neutral-400 hover:text-white transition-all text-sm" aria-label="Search teams">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Search</span>
                <kbd className="hidden sm:inline text-xs bg-pitch-700 px-1.5 py-0.5 rounded border border-neutral-600">⌘K</kbd>
              </button>
              <Link to="/teams" className="relative p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-pitch-800 transition-all" aria-label="Favourite teams">
                <Star className="w-4 h-4" />
                {favourites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-pitch-950 text-xs font-bold rounded-full flex items-center justify-center">
                    {favourites.length}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-pitch-800 transition-all" aria-label="Toggle menu">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-neutral-700/50 bg-pitch-900/98 backdrop-blur-md animate-slide-up">
            <nav className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    pathname === link.href ? "bg-pitch-700 text-white" : "text-neutral-300 hover:text-white hover:bg-pitch-800"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {isOpen && <SearchModal onClose={closeSearch} />}
    </>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const { query, setQuery, results, setResults } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useSearch(query);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (data) setResults(data); }, [data, setResults]);

  return (
    <div className="fixed inset-0 z-[100] bg-pitch-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl bg-pitch-800 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-700/50">
          <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
          <input ref={inputRef} type="text" placeholder="Search teams, players..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none text-base" />
          {query && <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>}
          <kbd className="text-xs bg-pitch-700 text-neutral-400 px-2 py-1 rounded border border-neutral-600">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading && <div className="px-4 py-8 text-center text-neutral-500 text-sm">Searching...</div>}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-neutral-500 text-sm">No results for "{query}"</div>
          )}
          {results.map((result) => (
            <Link key={`${result.type}-${result.id}`} to={result.href} onClick={onClose} className="flex items-center gap-3 px-4 py-3 hover:bg-pitch-700 transition-colors">
              {result.image && <img src={result.image} alt={result.name} className="w-8 h-8 object-contain flex-shrink-0" />}
              <div>
                <p className="text-white text-sm font-medium">{result.name}</p>
                {result.subtitle && <p className="text-neutral-400 text-xs">{result.subtitle}</p>}
              </div>
              <span className="ml-auto text-xs text-neutral-500 capitalize bg-pitch-700 px-2 py-0.5 rounded">{result.type}</span>
            </Link>
          ))}
          {!query && (
            <div className="px-4 py-6 text-center">
              <p className="text-neutral-500 text-sm">Search for Premier League clubs, Champions League teams, and more</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
