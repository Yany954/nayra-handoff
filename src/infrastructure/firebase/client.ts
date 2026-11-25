"use client";

import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from "firebase/auth";

let cached: Auth | null = null;

function clientAuth(): Auth {
  if (cached) return cached;
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  cached = getAuth(app);
  const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  if (emulator) connectAuthEmulator(cached, `http://${emulator}`, { disableWarnings: true });
  return cached;
}

export type GoogleSignInResult =
  | { ok: true; idToken: string }
  | { ok: false; reason: "denied" | "cancelled" | "error" };

/**
 * Opens Google's popup and returns a fresh ID token. The browser session is dropped right
 * after: the panel runs on the server-side cookie, so no client auth state lingers.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const auth = clientAuth();
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    const idToken = await credential.user.getIdToken();
    await signOut(auth);
    return { ok: true, idToken };
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    const message = (error as { message?: string }).message ?? "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return { ok: false, reason: "cancelled" };
    }
    // Blocking functions reject non-allowlisted accounts before they exist. The SDK surfaces
    // that as auth/internal-error with the function's PERMISSION_DENIED response in the message.
    if (/BLOCKING_FUNCTION|PERMISSION_DENIED|permission-denied/.test(message)) {
      return { ok: false, reason: "denied" };
    }
    return { ok: false, reason: "error" };
  }
}
