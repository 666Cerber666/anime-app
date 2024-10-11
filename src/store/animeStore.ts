// src/store/animeStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AnimeState {
  animeList: any[];
  filters: {
    type?: string;
    rating?: string;
    status?: string;
    genres?: number[];
    excludedGenres?: number[];
    producers?: number[];
    period?: { start?: string; end?: string };
  };
  sort: string;
  page: number;
  setFilters: (filters: Partial<AnimeState['filters']>) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  fetchAnimes: () => Promise<void>;
}

const fetchAnimeList = async (page: number, filters: any) => {
    const response = await fetch(`https://api.jikan.moe/v4/anime?page=${page}&${new URLSearchParams(filters)}`);
    return await response.json();
};

export const useAnimeStore = create<AnimeState>((set, get) => ({
  animeList: [],
  filters: {},
  sort: 'popularity',
  page: 1,
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set({ page }),
  fetchAnimes: async () => {
    const { filters, sort, page } = get();
    const result = await fetchAnimeList(page, { ...filters, sort });
    set({ animeList: result.data });
  },
}));

// Стор для "просмотреть позже"
interface WatchLaterState {
  watchLater: any[];
  addWatchLater: (anime: any, weight: number) => void;
  sortWatchLater: (by: string) => void;
}

export const useWatchLaterStore = create(
  persist<WatchLaterState>(
    (set) => ({
      watchLater: [],
      addWatchLater: (anime, weight) => set((state) => ({
        watchLater: [...state.watchLater, { ...anime, weight, addedAt: new Date() }],
      })),
      sortWatchLater: (by) => set((state) => ({
        watchLater: state.watchLater.sort((a, b) => {
          if (by === 'weight') return b.weight - a.weight;
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        }),
      })),
    }),
    { name: 'watch-later-storage' }
  )
);
