import { describe, expect, it } from "vitest";
import {
  epkFormSchema,
  fieldErrorsOf,
  formatFormSchema,
  promoterFormSchema,
  songFormSchema,
} from "@/infrastructure/schemas/panel";

describe("panel form schemas", () => {
  it("treats an empty key as no key and a missing checkbox as false", () => {
    const song = songFormSchema.parse({ title: "El vendaval", artist: "Farid Ortiz", genre: "Vallenato", order: "8", key: " " });
    expect(song).toMatchObject({ key: null, inMainShow: false, order: 8 });
    expect(songFormSchema.parse({ title: "a", artist: "b", genre: "Baladas", order: "1", key: "Am", inMainShow: "on" })).toMatchObject({ key: "Am", inMainShow: true });
  });

  it("rejects a format whose max duration is below the min", () => {
    const result = formatFormSchema.safeParse({
      name: "Dúo", shortName: "Dúo", durationMin: "60", durationMax: "30",
      membersLabel: "Voz + guitarra", membersCount: "2", idealFor: "Bodas", order: "1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error)).toHaveProperty("durationMax");
  });

  it("splits rider lines and drops blank ones", () => {
    const epk = epkFormSchema.parse({
      eyebrow: "Kit de prensa", intro: "Intro", rate: "A convenir", coverageStat: "13", coverageStatLabel: "municipios",
      technicalRider: "2 micrófonos\n\n  Monitor de piso  \n", hospitalityRider: "Agua",
      bioShort: "Bio", base: "Curumaní", genresSummary: "Vallenato",
    });
    expect(epk.technicalRider).toEqual(["2 micrófonos", "Monitor de piso"]);
  });

  it("keeps optional promoter dates null when empty", () => {
    const promoter = promoterFormSchema.parse({
      type: "Hotel", name: "Hotel X", city: "", contact: "", socialOrWeb: "", stage: "prospecto",
      nextFollowUpAt: "", eventDate: "2027-02-14", notes: "",
    });
    expect(promoter).toMatchObject({ nextFollowUpAt: null, eventDate: "2027-02-14" });
  });
});
