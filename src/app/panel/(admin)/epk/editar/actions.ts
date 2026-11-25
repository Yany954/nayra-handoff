"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { readForm } from "@/infrastructure/schemas/form-data";
import { epkFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = [
  "eyebrow", "intro", "rate", "coverageStat", "coverageStatLabel",
  "technicalRider", "hospitalityRider", "bioShort", "base", "genresSummary",
] as const;

export async function saveEpkAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const form = readForm(formData, epkFormSchema, FIELDS);
  if (!form.ok) return form.error;
  const { bioShort, base, genresSummary, ...epk } = form.data;
  await adminRepositories().saveEpk(epk, { bioShort, base, genresSummary });
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "EPK guardado. La vista previa y el PDF ya usan estos datos." };
}
