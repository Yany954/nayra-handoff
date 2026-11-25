import { describe, expect, it } from "vitest";
import type { Format, PublicSong, Show } from "@/domain/entities";
import { formatDuration, summarizeFormats } from "@/domain/rules/formats";
import {
  formatShowDate,
  latestPastShow,
  publicUpcomingShows,
  toBogotaDateKey,
  upcomingShows,
} from "@/domain/rules/shows";
import { countMainShowSongs, filterSongs } from "@/domain/rules/songs";

const song = (id: string, order: number, over: Partial<PublicSong> = {}): PublicSong => ({
  id,
  title: id,
  artist: "A",
  genre: "Vallenato",
  inMainShow: false,
  order,
  ...over,
});

const show = (id: string, date: string | null): Show => ({
  id,
  venue: id,
  city: "Curumaní",
  date,
  status: "confirmado",
});

const format = (over: Partial<Format>): Format => ({
  id: "f",
  name: "F",
  shortName: "F",
  durationMin: 30,
  durationMax: 30,
  membersLabel: "1",
  membersCount: 1,
  idealFor: "",
  order: 0,
  ...over,
});

describe("filterSongs", () => {
  const songs = [
    song("b", 2, { genre: "Rancheras", inMainShow: true }),
    song("a", 1),
  ];

  it("returns every song in order for Todo", () => {
    expect(filterSongs(songs, "Todo").map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("filters the main show", () => {
    expect(filterSongs(songs, "Show principal").map((s) => s.id)).toEqual(["b"]);
    expect(countMainShowSongs(songs)).toBe(1);
  });
  it("filters by genre and can be empty", () => {
    expect(filterSongs(songs, "Rancheras").map((s) => s.id)).toEqual(["b"]);
    expect(filterSongs(songs, "Tambora")).toEqual([]);
  });
});

describe("shows", () => {
  const shows = [
    show("later", "2027-01-11"),
    show("today", "2026-12-07"),
    show("past", "2026-12-06"),
    show("undated", null),
  ];

  it("keeps a show upcoming on its own date, sorted ascending", () => {
    expect(upcomingShows(shows, "2026-12-07").map((s) => s.id)).toEqual([
      "today",
      "later",
    ]);
  });
  it("hides unconfirmed dates from the public", () => {
    const withPending = [...shows, { ...show("pending", "2027-02-01"), status: "por_confirmar" as const }];
    expect(publicUpcomingShows(withPending, "2026-12-07").map((s) => s.id)).toEqual([
      "today",
      "later",
    ]);
  });
  it("prefers the latest dated past show", () => {
    expect(latestPastShow(shows, "2026-12-07")?.id).toBe("past");
  });
  it("falls back to an undated show", () => {
    expect(latestPastShow(shows, "2026-01-01")?.id).toBe("undated");
  });
  it("uses the Colombian calendar day", () => {
    expect(toBogotaDateKey(new Date("2026-12-08T03:00:00Z"))).toBe("2026-12-07");
  });
  it("formats month and day in Spanish", () => {
    expect(formatShowDate("2027-01-11")).toEqual({ month: "ENE", day: "11" });
  });
});

describe("summarizeFormats", () => {
  it("derives the EPK facts", () => {
    const summary = summarizeFormats([
      format({ shortName: "Pista", durationMin: 45, durationMax: 45, membersCount: 1, order: 1 }),
      format({ shortName: "Acústico", durationMin: 30, durationMax: 45, membersCount: 2, order: 2 }),
      format({ shortName: "Conjunto", durationMin: 60, durationMax: 90, membersCount: 5, order: 3 }),
      format({ shortName: "Tambora", durationMin: 30, durationMax: 30, membersCount: 4, order: 4 }),
    ]);
    expect(summary).toEqual({
      count: 4,
      durationRange: "30–90",
      durations: "30, 45, 60 o 90 min",
      members: "1 a 5 según formato",
      names: "Pista · Acústico · Conjunto · Tambora",
    });
  });
  it("handles no formats", () => {
    expect(summarizeFormats([]).count).toBe(0);
  });
  it("formats single and ranged durations", () => {
    expect(formatDuration({ durationMin: 45, durationMax: 45 })).toBe("45 min");
    expect(formatDuration({ durationMin: 30, durationMax: 45 })).toBe("30–45 min");
  });
});
