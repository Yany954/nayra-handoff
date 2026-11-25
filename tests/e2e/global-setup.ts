import { mkdirSync, writeFileSync } from "node:fs";
import { getAuth } from "firebase-admin/auth";
import { firebaseApp } from "../../src/infrastructure/firebase/admin";

export const ADMIN_STATE = "tests/e2e/.auth/admin.json";

/**
 * Signs an allowlisted admin into the Auth emulator and stores the session cookie,
 * so panel pages can be tested without Google's popup. Emulator only.
 */
export default async function globalSetup() {
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (!authHost) throw new Error("FIREBASE_AUTH_EMULATOR_HOST is not set: e2e tests only run against the emulators.");
  const email = (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim();
  if (!email) throw new Error("ADMIN_EMAILS is empty.");

  const auth = getAuth(firebaseApp());
  const password = "e2e-only-password";
  const user = await auth.getUserByEmail(email).catch(() => auth.createUser({ email, emailVerified: true, displayName: "Admin E2E" }));
  await auth.updateUser(user.uid, { password, emailVerified: true });
  await auth.setCustomUserClaims(user.uid, { admin: true });

  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=e2e`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, returnSecureToken: true }) },
  );
  const body = (await response.json()) as { idToken?: string; error?: { message?: string } };
  const idToken = body.idToken;
  if (!idToken) {
    // Locally the blocking functions also run: the e2e email must be in functions/.env.local too.
    throw new Error(`Could not sign in the e2e admin ${email}: ${body.error?.message ?? response.status}`);
  }
  const cookie = await auth.createSessionCookie(idToken, { expiresIn: 60 * 60 * 1000 });

  mkdirSync("tests/e2e/.auth", { recursive: true });
  writeFileSync(
    ADMIN_STATE,
    JSON.stringify({
      cookies: [{ name: "__session", value: cookie, domain: "localhost", path: "/", expires: -1, httpOnly: true, secure: false, sameSite: "Lax" }],
      origins: [],
    }),
  );
}
