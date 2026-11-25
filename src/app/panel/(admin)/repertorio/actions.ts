"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { isDocId, readForm } from "@/infrastructure/schemas/form-data";
import { songFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = ["title", "artist", "genre", "inMainShow", "order", "key"] as const;

export async function saveSongAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const form = readForm(formData, songFormSchema, FIELDS);
  if (!form.ok) return form.error;
  await adminRepositories().saveSong(form.id, form.data);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: form.id ? "Canción actualizada." : "Canción agregada." };
}

export async function deleteSongAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Canción inválida." };
  await adminRepositories().deleteSong(id);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Canción borrada." };
}
