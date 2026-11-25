"use server";

import { refresh, updateTag } from "next/cache";
import { approveFoundEvent, publishShowFromPromoter, requestManualScan, savePromoter } from "@/application/panel";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { isDocId, readForm } from "@/infrastructure/schemas/form-data";
import { promoterFormSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = ["type", "name", "city", "contact", "socialOrWeb", "stage", "nextFollowUpAt", "eventDate", "notes"] as const;

export async function savePromoterAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const form = readForm(formData, promoterFormSchema, FIELDS);
  if (!form.ok) return form.error;
  const now = new Date();
  await savePromoter(adminRepositories(), form.id, form.data, toBogotaDateKey(now), now);
  // Private data is never cached, so there is no tag to expire: just re-render the panel.
  refresh();
  return { status: "ok", message: form.id ? "Promotor actualizado." : "Promotor agregado." };
}

export async function deletePromoterAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Promotor inválido." };
  await adminRepositories().deletePromoter(id);
  refresh();
  return { status: "ok", message: "Promotor borrado." };
}

export async function publishShowAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Promotor inválido." };
  const result = await publishShowFromPromoter(adminRepositories(), id);
  if (result === "already_published") return { status: "error", message: "Este evento ya está publicado en «Shows y fechas»." };
  if (result !== "ok") return { status: "error", message: "Solo se publican los promotores en «Cerrado»." };
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Publicado como show confirmado. Revísalo en «Shows y fechas»." };
}

export async function approveFoundAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Evento inválido." };
  const result = await approveFoundEvent(adminRepositories(), id, new Date());
  if (result !== "ok") return { status: "error", message: "Este evento ya fue revisado." };
  refresh();
  return { status: "ok", message: "Agregado a Prospectos. Lo encuentras en la pestaña Promotores." };
}

export async function discardFoundAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(id)) return { status: "error", message: "Evento inválido." };
  await adminRepositories().discardDiscoveredEvent(id);
  refresh();
  return { status: "ok", message: "Descartado. No volverá a aparecer en próximas búsquedas." };
}

export async function requestScanAction(): Promise<FormState> {
  const admin = await requireAdmin();
  const check = await requestManualScan(adminRepositories(), admin.email, new Date());
  if (!check.ok) return { status: "error", message: check.reason };
  return { status: "ok", message: "Buscando… Los resultados aparecen aquí en uno o dos minutos." };
}
