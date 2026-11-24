"use client";

import { useState } from "react";
import type { PublicSong } from "@/domain/entities";
import {
  ALL_SONGS_FILTER,
  MAIN_SHOW_FILTER,
  SONG_FILTERS,
  filterSongs,
  type SongFilter,
} from "@/domain/rules/songs";

export function RepertoireBrowser({ songs }: { songs: PublicSong[] }) {
  const [filter, setFilter] = useState<SongFilter>(ALL_SONGS_FILTER);
  const shown = filterSongs(songs, filter);
  const emptyName =
    filter === ALL_SONGS_FILTER || filter === MAIN_SHOW_FILTER
      ? "del repertorio"
      : `de ${filter.toLowerCase()}`;

  return (
    <div className="mx-auto box-border flex w-full max-w-[1360px] flex-col gap-7 px-5 pb-20 pt-10 lg:px-12 lg:pb-[120px] lg:pt-12">
      <div role="group" aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
        {SONG_FILTERS.map((option) => {
          const on = option === filter;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(option)}
              className={`min-h-11 cursor-pointer rounded-full px-[18px] text-sm ${
                on
                  ? "border-0 bg-text-dark font-semibold text-text-light"
                  : "border border-line-light bg-white font-medium text-text-dark"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {shown.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-3 p-0">
          {shown.map((song, index) => (
            <li
              key={song.id}
              className="flex min-h-[76px] flex-wrap items-center gap-x-[18px] gap-y-2 rounded-card-sm border border-line-light bg-white px-[22px] py-[18px] sm:flex-nowrap"
            >
              <span className="w-6 shrink-0 font-mono text-[13px] text-muted-on-light">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-[1_1_calc(100%-42px)] flex-col gap-[3px] sm:flex-1">
                <span className="text-base font-semibold">{song.title}</span>
                <span className="text-sm text-muted-on-light">{song.artist}</span>
              </div>
              <div className="flex gap-[18px] pl-[42px] sm:contents">
                <span className="whitespace-nowrap rounded-full bg-cream-soft px-2.5 py-1.5 text-xs text-text-body">
                  {song.genre}
                </span>
                {song.inMainShow && (
                  <span className="whitespace-nowrap rounded-full bg-text-dark px-2.5 py-1.5 text-xs text-text-light">
                    Show
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-card border-[1.5px] border-dashed border-line-strong p-8 text-center sm:p-14">
          <span className="font-display text-[28px] font-bold">Próximamente</span>
          <span className="max-w-[420px] text-[15px] text-muted-on-light">
            Las canciones {emptyName} se agregarán desde el panel de la manager y aparecerán aquí automáticamente.
          </span>
        </div>
      )}
    </div>
  );
}
