import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Loader2 className="w-8 h-8 text-grass-500 animate-spin" />
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-pitch-800 rounded-xl border border-neutral-700/30 animate-pulse", className)}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-700/50 rounded w-3/4" />
        <div className="h-3 bg-neutral-700/30 rounded w-1/2" />
        <div className="h-3 bg-neutral-700/30 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-5", className)}>
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-neutral-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface StatBarProps {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  homePercent?: number;
  awayPercent?: number;
}

export function StatBar({ label, homeValue, awayValue, homePercent, awayPercent }: StatBarProps) {
  const total =
    typeof homeValue === "number" && typeof awayValue === "number"
      ? homeValue + awayValue
      : 100;
  const hp =
    homePercent !== undefined
      ? homePercent
      : typeof homeValue === "number"
      ? Math.round((homeValue / total) * 100)
      : 50;
  const ap = awayPercent !== undefined ? awayPercent : 100 - hp;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-neutral-400">
        <span className="font-bold text-white">{homeValue}</span>
        <span>{label}</span>
        <span className="font-bold text-white">{awayValue}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-pitch-700">
        <div className="bg-grass-500 transition-all duration-500" style={{ width: `${hp}%` }} />
        <div className="bg-red-500 transition-all duration-500" style={{ width: `${ap}%` }} />
      </div>
    </div>
  );
}

type BadgeVariant = "default" | "live" | "finished" | "upcoming" | "success" | "warning" | "danger";

interface BadgeProps { children: ReactNode; variant?: BadgeVariant; className?: string }

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-neutral-700 text-neutral-300",
  live: "bg-grass-500/15 text-grass-400 border border-grass-500/30",
  finished: "bg-neutral-700/60 text-neutral-400",
  upcoming: "bg-pitch-700 text-neutral-400",
  success: "bg-grass-500/10 text-grass-400",
  warning: "bg-amber-500/10 text-amber-400",
  danger: "bg-red-600/10 text-red-400",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", badgeVariants[variant], className)}>
      {children}
    </span>
  );
}

interface EmptyStateProps { title: string; description?: string; icon?: ReactNode; action?: ReactNode }

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-neutral-600">{icon}</div>}
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-neutral-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Failed to load data. Please try again.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-red-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-pitch-700 hover:bg-pitch-600 text-white text-sm rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

interface Tab { id: string; label: string; icon?: ReactNode }
interface TabNavProps { tabs: Tab[]; activeTab: string; onChange: (id: string) => void; className?: string }

export function TabNav({ tabs, activeTab, onChange, className }: TabNavProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-pitch-800 rounded-xl border border-neutral-700/50", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center",
            activeTab === tab.id ? "bg-pitch-600 text-white shadow-sm" : "text-neutral-400 hover:text-white"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function RefreshIndicator({ lastUpdated }: { lastUpdated: number | null }) {
  if (!lastUpdated) return null;
  const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
  return (
    <p className="text-neutral-600 text-xs">
      Updated {seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`}
    </p>
  );
}
