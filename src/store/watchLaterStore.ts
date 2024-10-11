import create, { StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface WatchLaterItem {
  mal_id: number;
  title: string;
  image_url: string;
  weight: number;
  addedAt: Date;
}

interface WatchLaterState {
  watchLater: WatchLaterItem[];
  addWatchLater: (item: WatchLaterItem) => void;
  removeWatchLater: (mal_id: number) => void;
  getSortedWatchLater: (primarySort: 'weight' | 'addedAt', secondarySort: 'weight' | 'addedAt') => WatchLaterItem[];
}

type MyPersist = (
  config: StateCreator<WatchLaterState>,
  options: PersistOptions<WatchLaterState>
) => StateCreator<WatchLaterState>;

const useWatchLaterStore = create<WatchLaterState>(
  (persist as MyPersist)(
    (set, get) => ({
      watchLater: [],
      addWatchLater: (item) =>
        set((state) => ({
          watchLater: [...state.watchLater, item],
        })),
      removeWatchLater: (mal_id) =>
        set((state) => ({
          watchLater: state.watchLater.filter((item) => item.mal_id !== mal_id),
        })),
      getSortedWatchLater: (primarySort, secondarySort) => {
        return [...get().watchLater].sort((a, b) => {
          if (a[primarySort] === b[primarySort]) {
            if (secondarySort === 'addedAt') {
              return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
            } else {
              return b[secondarySort] - a[secondarySort];
            }
          }
          if (primarySort === 'addedAt') {
            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
          } else {
            return b[primarySort] - a[primarySort];
          }
        });
      },
    }),
    { name: 'watch-later-storage' }
  )
);

export default useWatchLaterStore;