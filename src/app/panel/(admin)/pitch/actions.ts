"use server";

import { markPitchSent } from "@/application/panel";
import { spellDate } from "@/domain/rules/pitch";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { isDocId } from "@/infrastructure/schemas/form-data";
import { fieldErrorsOf, pitchFormFields, pitchFromForm } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

export async function markPitchSentAction(promoterId: string): Promise<FormState> {
  await requireAdmin();
  if (!isDocId(promoterId)) return { status: "error", message: "Promotor inválido." };
  const updated = await markPitchSent(adminRepositories(), promoterId, toBogotaDateKey(new Date()));
  if (!updated) return { status: "error", message: "No encontramos ese promotor." };
  // No refresh(): re-rendering would remount the generator and drop this confirmation.
  // Panel pages are dynamic, so the new stage shows on the next navigation.
  return { status: "ok", message: `Marcado como «Contactado». Próximo seguimiento: ${updated.nextFollowUpAt ? spellDate(updated.nextFollowUpAt) : "sin fecha"}.` };
}

export async function savePitchTemplatesAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = Object.fromEntries(pitchFormFields.map((name) => [name, formData.get(name) ?? ""]));
  const parsed = pitchFromForm(values);
  if (!parsed.success) {
    // Nested paths (kinds.hotel.subject) map back to the flat field names.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const [first, kind, part] = issue.path.map(String);
      const key = first === "kinds" ? `${kind}_${part}` : first;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : fieldErrorsOf(parsed.error) };
  }
  await adminRepositories().savePitch(parsed.data);
  return { status: "ok", message: "Plantillas guardadas." };
}
