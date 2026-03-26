import { Link } from "react-router-dom";
import { Zap, Github, Twitter } from "lucide-react";

const FOOTER_LINKS = {
  Leagues: [
    { label: "Premier League", href: "/premier-league" },
    { label: "Champions League", href: "/champions-league" },
    { label: "Fixtures", href: "/fixtures" },
  ],
  Tools: [
    { label: "Odds Comparison", href: "/odds" },
    { label: "Team Pages", href: "/teams" },
    { label: "Live Scores", href: "/" },
  ],
  Legal: [
    { label: "Gambling Awareness", href: "https://www.begambleaware.org", external: true },
  ],
};

export function Footer() {
  return (
    <footer className="bg-pitch-900 border-t border-neutral-700/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-grass-gradient flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-pitch-950 fill-pitch-950" />
              </div>
              <span className="font-display font-bold text-white">Football<span className="text-grass-400">Live</span>Hub</span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Real-time scores, fixtures, odds, and in-depth stats for Premier League and Champions League.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-pitch-800 text-neutral-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-pitch-800 text-neutral-400 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white text-sm font-semibold mb-4">{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white text-sm transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.href} className="text-neutral-400 hover:text-white text-sm transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-700/50 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-neutral-600 text-xs">© {new Date().getFullYear()} Football Live Hub. Data provided by API-Football.</p>
          <p className="text-neutral-600 text-xs">
            18+ | Gamble Responsibly |{" "}
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-400">BeGambleAware.org</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
