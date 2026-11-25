import { z } from "zod";
import { fieldErrorsOf } from "@/infrastructure/schemas/panel";

const docId = z.string().regex(/^[\w.-]{1,128}$/);

export type FormError = { status: "error"; message: string; fieldErrors?: Record<string, string> };
export type ParsedForm<T> = { ok: true; id: string | null; data: T } | { ok: false; error: FormError };

export function isDocId(value: unknown): value is string {
  return docId.safeParse(value).success;
}

/**
 * Validates a panel form: an optional `id` (edit) plus the schema's fields.
 * Every field the schema declares is read, so unchecked checkboxes arrive as undefined.
 */
export function readForm<S extends z.ZodType>(
  formData: FormData,
  schema: S,
  fieldNames: readonly string[],
): ParsedForm<z.output<S>> {
  const rawId = formData.get("id");
  if (rawId !== null && rawId !== "" && !isDocId(rawId)) {
    return { ok: false, error: { status: "error", message: "Registro inválido." } };
  }
  const input = Object.fromEntries(fieldNames.map((name) => [name, formData.get(name) ?? undefined]));
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsOf(parsed.error) } };
  }
  return { ok: true, id: typeof rawId === "string" && rawId !== "" ? rawId : null, data: parsed.data as z.output<S> };
}
