import "server-only";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AdminUser } from "@/domain/entities";
import { isAllowedAdmin, parseAllowlist } from "@/domain/rules/admins";
import { firebaseApp } from "@/infrastructure/firebase/admin";

/** Firebase Hosting and App Hosting only forward a cookie with this exact name. */
export const SESSION_COOKIE = "__session";
const SESSION_DAYS = 5;
/** A sign-in older than this cannot be turned into a session (Firebase's recommendation). */
const MAX_SIGN_IN_AGE_SECONDS = 5 * 60;

const auth = () => getAuth(firebaseApp());
const allowlist = () => parseAllowlist(process.env.ADMIN_EMAILS);

export type SessionResult = { ok: true } | { ok: false; reason: "denied" | "expired" | "invalid" };

/** Exchanges a fresh Google ID token for an httpOnly session cookie, only for allowlisted admins. */
export async function createSession(idToken: string): Promise<SessionResult> {
  let claims;
  try {
    claims = await auth().verifyIdToken(idToken, true);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (!isAllowedAdmin(claims, allowlist())) return { ok: false, reason: "denied" };
  if (Date.now() / 1000 - claims.auth_time > MAX_SIGN_IN_AGE_SECONDS) return { ok: false, reason: "expired" };

  const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
  const cookie = await auth().createSessionCookie(idToken, { expiresIn });
  (await cookies()).set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn / 1000,
  });
  return { ok: true };
}

/** Returns the admin or null; never throws for a bad cookie. */
export async function readAdmin(): Promise<AdminUser | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  // Verification checks expiry against the clock: request time only, never in a prefetch.
  await connection();
  try {
    const claims = await auth().verifySessionCookie(cookie, true);
    if (!isAllowedAdmin(claims, allowlist())) return null;
    const email = claims.email as string;
    const name = typeof claims.name === "string" && claims.name ? claims.name : email.split("@")[0];
    return { uid: claims.uid, email, name };
  } catch {
    return null;
  }
}

/**
 * The real gate (Data Access Layer). Every panel page and every Server Action calls it
 * first: Server Actions are public endpoints, so the proxy redirect alone is not enough.
 * Memoized per request with React `cache`.
 */
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const admin = await readAdmin();
  if (!admin) redirect("/panel/login");
  return admin;
});

/** Revokes refresh tokens too, so a stolen cookie stops working everywhere. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  store.delete(SESSION_COOKIE);
  if (!cookie) return;
  try {
    const { sub } = await auth().verifySessionCookie(cookie);
    await auth().revokeRefreshTokens(sub);
  } catch {
    // Already invalid: nothing to revoke.
  }
}
