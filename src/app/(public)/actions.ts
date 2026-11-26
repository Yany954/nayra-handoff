"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { submitBooking } from "@/application/booking";
import { looksLikeBot } from "@/domain/rules/booking";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { bookingRepositories } from "@/infrastructure/container";
import { validateBooking } from "@/infrastructure/schemas/booking";
import type { FormState } from "@/presentation/components/panel/form";

const FIELDS = ["name", "phone", "email", "eventType", "eventDate", "municipality", "message", "consent"] as const;
const SENT: FormState = { status: "ok", message: "¡Gracias! Recibimos tu solicitud. La manager te responde pronto con disponibilidad y formatos." };

/** Public contact form. No login: protected by validation, a honeypot, a minimum fill time and a rate limit. */
export async function submitBookingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  // Bots get the same success answer, so they learn nothing about the filter.
  if (looksLikeBot(String(formData.get("website") ?? ""), Number(formData.get("elapsedMs")))) return SENT;

  const now = new Date();
  const parsed = validateBooking(Object.fromEntries(FIELDS.map((f) => [f, formData.get(f) ?? undefined])), toBogotaDateKey(now));
  if (!parsed.ok) return { status: "error", message: "Revisa los campos marcados.", fieldErrors: parsed.fieldErrors };

  // Only a salted hash of the IP is stored, never the address itself.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const senderKey = createHash("sha256").update(`nayra-booking|${ip}`).digest("hex").slice(0, 24);

  const result = await submitBooking(bookingRepositories(), parsed.data, senderKey, now);
  if (result === "rate_limited") {
    return { status: "error", message: "Recibimos varias solicitudes seguidas desde tu conexión. Inténtalo en una hora o escríbenos por WhatsApp." };
  }
  return SENT;
}
