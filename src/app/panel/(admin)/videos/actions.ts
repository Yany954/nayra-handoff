"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { isDocId, readForm } from "@/infrastructure/schemas/form-data";
import { videoFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = ["title", "context", "url", "featured", "order"] as const;

export async function saveVideoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const form = readForm(formData, videoFormSchema, FIELDS);
  if (!form.ok) return form.error;
  await adminRepositories().saveVideo(form.id, form.data);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: form.id ? "Video actualizado." : "Video agregado." };
}

export async function deleteVideoAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Video inválido." };
  await adminRepositories().deleteVideo(id);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Video borrado." };
}
