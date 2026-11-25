"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { isDocId, readForm } from "@/infrastructure/schemas/form-data";
import { achievementFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = ["title", "subtitle", "kind", "label", "epkLine", "featured", "order"] as const;

export async function saveAchievementAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const form = readForm(formData, achievementFormSchema, FIELDS);
  if (!form.ok) return form.error;
  await adminRepositories().saveAchievement(form.id, form.data);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: form.id ? "Logro actualizado." : "Logro agregado." };
}

export async function deleteAchievementAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Logro inválido." };
  await adminRepositories().deleteAchievement(id);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Logro borrado." };
}
