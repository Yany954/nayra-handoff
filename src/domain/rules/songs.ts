import { SONG_GENRES, type PublicSong, type SongGenre } from "@/domain/entities";

export const ALL_SONGS_FILTER = "Todo";
export const MAIN_SHOW_FILTER = "Show principal";

export type SongFilter =
  | typeof ALL_SONGS_FILTER
  | typeof MAIN_SHOW_FILTER
  | SongGenre;

export const SONG_FILTERS: readonly SongFilter[] = [
  ALL_SONGS_FILTER,
  MAIN_SHOW_FILTER,
  ...SONG_GENRES,
];

export function filterSongs(
  songs: readonly PublicSong[],
  filter: SongFilter,
): PublicSong[] {
  const sorted = [...songs].sort((a, b) => a.order - b.order);
  if (filter === ALL_SONGS_FILTER) return sorted;
  if (filter === MAIN_SHOW_FILTER) return sorted.filter((s) => s.inMainShow);
  return sorted.filter((s) => s.genre === filter);
}

export function countMainShowSongs(songs: readonly PublicSong[]): number {
  return songs.filter((s) => s.inMainShow).length;
}
