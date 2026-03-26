// ============================================
// Football Live Hub - Zustand Global Store
// ============================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FavouriteTeam, SearchResult } from "@/types";

// ---- Favourites Store ----
interface FavouritesState {
  favourites: FavouriteTeam[];
  addFavourite: (team: FavouriteTeam) => void;
  removeFavourite: (teamId: number) => void;
  isFavourite: (teamId: number) => boolean;
  clearFavourites: () => void;
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      favourites: [],
      addFavourite: (team) =>
        set((state) => ({
          favourites: state.favourites.some((f) => f.id === team.id)
            ? state.favourites
            : [...state.favourites, team],
        })),
      removeFavourite: (teamId) =>
        set((state) => ({
          favourites: state.favourites.filter((f) => f.id !== teamId),
        })),
      isFavourite: (teamId) => get().favourites.some((f) => f.id === teamId),
      clearFavourites: () => set({ favourites: [] }),
    }),
    {
      name: "flh-favourites",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ---- Search Store ----
interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  setQuery: (q: string) => void;
  setResults: (r: SearchResult[]) => void;
  setIsSearching: (v: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isSearching: false,
  isOpen: false,
  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r }),
  setIsSearching: (v) => set({ isSearching: v }),
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: "", results: [] }),
  clearSearch: () => set({ query: "", results: [] }),
}));

// ---- Live Score Store ----
interface LiveScoreState {
  lastUpdated: number | null;
  isRefreshing: boolean;
  setLastUpdated: (t: number) => void;
  setIsRefreshing: (v: boolean) => void;
}

export const useLiveScoreStore = create<LiveScoreState>((set) => ({
  lastUpdated: null,
  isRefreshing: false,
  setLastUpdated: (t) => set({ lastUpdated: t }),
  setIsRefreshing: (v) => set({ isRefreshing: v }),
}));

// ---- UI Store ----
interface UIState {
  mobileMenuOpen: boolean;
  selectedLeague: number | null;
  fixturesDateFilter: string;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setSelectedLeague: (id: number | null) => void;
  setFixturesDateFilter: (date: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  selectedLeague: null,
  fixturesDateFilter: new Date().toISOString().split("T")[0],
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  setSelectedLeague: (id) => set({ selectedLeague: id }),
  setFixturesDateFilter: (date) => set({ fixturesDateFilter: date }),
}));
