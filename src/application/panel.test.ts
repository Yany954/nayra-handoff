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
