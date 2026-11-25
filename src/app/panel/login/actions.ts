"use server";

import { createSession, type SessionResult } from "@/infrastructure/auth/session";

export async function startSession(idToken: string): Promise<SessionResult> {
  if (typeof idToken !== "string" || idToken.length > 8192) return { ok: false, reason: "invalid" };
  return createSession(idToken);
}
