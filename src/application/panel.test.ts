import { describe, expect, it } from "vitest";
import type { GalleryPhoto, Show } from "@/domain/entities";
import type { AdminRepositories } from "@/domain/repositories";
import { getShowsAdmin, moveGalleryPhoto } from "@/application/panel";

function fakeRepos(overrides: Partial<AdminRepositories>): AdminRepositories {
  const fail = () => {
    throw new Error("not used in this test");
  };
  return new Proxy(overrides as AdminRepositories, {
    get: (target, key) => (key in target ? target[key as keyof AdminRepositories] : fail),
  });
}

const show = (id: string, date: string | null, status: Show["status"] = "confirmado"): Show => ({
  id,
  venue: id,
  city: "Curumaní",
  date,
  status,
});

describe("panel use cases", () => {
  it("orders shows and labels how the public site uses each one", async () => {
    const repos = fakeRepos({
      listShows: async () => [
        show("old", "2026-01-10"),
        show("undated", null),
        show("later", "2027-03-01"),
        show("tentative", "2026-12-20", "por_confirmar"),
        show("recent", "2026-11-01"),
        show("soon", "2026-12-07"),
      ],
    });
    const { rows } = await getShowsAdmin(repos, "2026-11-25");
    expect(rows.map((r) => [r.id, r.publicRole])).toEqual([
      ["soon", "proximo"],
      ["tentative", "oculto_por_confirmar"],
      ["later", "proximo"],
      ["recent", "ultimo"],
      ["old", "pasado"],
      ["undated", "pasado"],
    ]);
  });

  it("moves a gallery photo one step and ignores moves past the ends", async () => {
    const photos = ["a", "b", "c"].map((id, i): GalleryPhoto => ({ id, src: "", alt: "", order: i }));
    const saved: string[][] = [];
    const repos = fakeRepos({
      listGallery: async () => photos,
      reorderGallery: async (ids) => {
        saved.push(ids);
      },
    });
    await moveGalleryPhoto(repos, "b", -1);
    await moveGalleryPhoto(repos, "a", -1);
    await moveGalleryPhoto(repos, "c", 1);
    expect(saved).toEqual([["b", "a", "c"]]);
  });
});

import { mergePromoter, nextOrder, publishShowFromPromoter, savePromoter } from "@/application/panel";
import type { Promoter } from "@/domain/entities";

const promoter: Promoter = {
  id: "p1", type: "Festival", name: "Festival de la Tambora", city: "Tamalameque", contact: "", socialOrWeb: "",
  stage: "prospecto", lastContactAt: null, nextFollowUpAt: null, eventDate: "2027-02-14", notes: "",
  source: "manual", createdAt: "2026-11-01T00:00:00.000Z",
};
const { id: _id, source: _s, createdAt: _c, lastContactAt: _l, ...input } = promoter;

describe("promoter use cases", () => {
  it("schedules the follow-up when moved to contactado", () => {
    const next = mergePromoter(promoter, { ...input, stage: "contactado" }, "2026-11-25");
    expect(next).toMatchObject({ stage: "contactado", lastContactAt: "2026-11-25", nextFollowUpAt: "2026-12-02" });
  });

  it("keeps a follow-up date the manager typed", () => {
    const next = mergePromoter(promoter, { ...input, stage: "contactado", nextFollowUpAt: "2026-11-28" }, "2026-11-25");
    expect(next.nextFollowUpAt).toBe("2026-11-28");
  });

  it("creates new promoters as manual and applies the stage rules", async () => {
    const created: unknown[] = [];
    const repos = fakeRepos({ createPromoter: async (p) => { created.push(p); return "new"; } });
    await savePromoter(repos, null, { ...input, stage: "contactado" }, "2026-11-25", new Date("2026-11-25T15:00:00Z"));
    expect(created[0]).toMatchObject({ source: "manual", stage: "contactado", nextFollowUpAt: "2026-12-02", createdAt: "2026-11-25T15:00:00.000Z" });
    expect(created[0]).not.toHaveProperty("id");
  });

  it("publishes only closed promoters as confirmed shows", async () => {
    const shows: unknown[] = [];
    const repos = fakeRepos({
      getPromoter: async (id) => (id === "closed" ? { ...promoter, stage: "cerrado" } : promoter),
      createShow: async (s) => { shows.push(s); return "s1"; },
      listShows: async () => shows.map((s, i) => ({ ...(s as Show), id: `s${i}` })),
    });
    expect(await publishShowFromPromoter(repos, "open")).toBe("not_closed");
    expect(await publishShowFromPromoter(repos, "closed")).toBe("ok");
    expect(await publishShowFromPromoter(repos, "closed")).toBe("already_published");
    expect(shows).toEqual([{ venue: "Festival de la Tambora", city: "Tamalameque", date: "2027-02-14", status: "confirmado" }]);
  });

  it("puts new items after the last position", () => {
    expect(nextOrder([{ order: 3 }, { order: 7 }])).toBe(8);
    expect(nextOrder([])).toBe(1);
  });
});
