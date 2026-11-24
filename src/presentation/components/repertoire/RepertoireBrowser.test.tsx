import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PublicSong } from "@/domain/entities";
import { RepertoireBrowser } from "@/presentation/components/repertoire/RepertoireBrowser";

describe("RepertoireBrowser", () => {
  it("never renders a musical key, even if one leaks into the data", () => {
    const leaked = {
      id: "s1",
      title: "Sigo esperando",
      artist: "Fabián Corrales",
      genre: "Vallenato",
      inMainShow: true,
      order: 1,
      key: "F#m-SECRET",
    } as PublicSong;

    const html = renderToStaticMarkup(<RepertoireBrowser songs={[leaked]} />);

    expect(html).toContain("Sigo esperando");
    expect(html).not.toContain("F#m-SECRET");
  });
});
