"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { saveShow } from "@/application/panel";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { showFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const docId = z.string().regex(/^[\w-]{1,128}$/);

export async function saveShowAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const rawId = String(formData.get("id") ?? "");
  if (rawId && !docId.safeParse(rawId).success) return { status: "error", message: "Show inválido." };

  const parsed = showFormSchema.safeParse({
    venue: formData.get("venue") ?? "",
    city: formData.get("city") ?? "",
    date: formData.get("date") ?? "",
    status: formData.get("status") ?? "",
    description: formData.get("description") ?? "",
    videoUrl: formData.get("videoUrl") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    );
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
  }

  await saveShow(adminRepositories(), rawId || null, parsed.data);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: rawId ? "Show actualizado." : "Show agregado." };
}

export async function deleteShowAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!docId.safeParse(id).success) return { status: "error", message: "Show inválido." };
  await adminRepositories().deleteShow(id);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Show borrado." };
}
