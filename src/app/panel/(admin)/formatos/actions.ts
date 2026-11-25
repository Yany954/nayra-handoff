"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { isDocId, readForm } from "@/infrastructure/schemas/form-data";
import { formatFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = ["name", "shortName", "durationMin", "durationMax", "membersLabel", "membersCount", "idealFor", "order"] as const;

export async function saveFormatAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const form = readForm(formData, formatFormSchema, FIELDS);
  if (!form.ok) return form.error;
  await adminRepositories().saveFormat(form.id, form.data);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: form.id ? "Formato actualizado." : "Formato agregado." };
}

export async function deleteFormatAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Formato inválido." };
  await adminRepositories().deleteFormat(id);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Formato borrado." };
}
