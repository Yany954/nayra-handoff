import { defineString } from "firebase-functions/params";
import { beforeUserCreated, beforeUserSignedIn, HttpsError } from "firebase-functions/v2/identity";
import { isAllowedAdmin, parseAllowlist } from "./allowlist";

/**
 * Google accounts allowed into the manager panel. Set per environment, never in code:
 * functions/.env.local for the emulator, and the deploy prompt for production.
 */
const ADMIN_EMAILS = defineString("ADMIN_EMAILS", {
  description: "Comma-separated Google accounts allowed into /panel",
});

const DENIED = "Esta cuenta no tiene acceso al panel.";

/** Runs before an account is created: strangers never get an account at all. */
export const onlyAdminsCanSignUp = beforeUserCreated((event) => {
  const user = event.data;
  if (!user || !isAllowedAdmin(user, parseAllowlist(ADMIN_EMAILS.value().split(",")))) {
    throw new HttpsError("permission-denied", DENIED);
  }
  return { customClaims: { admin: true } };
});

/** Runs on every sign-in: removing an email from the list cuts access on the next login. */
export const onlyAdminsCanSignIn = beforeUserSignedIn((event) => {
  const user = event.data;
  if (!user || !isAllowedAdmin(user, parseAllowlist(ADMIN_EMAILS.value().split(",")))) {
    throw new HttpsError("permission-denied", DENIED);
  }
  return { customClaims: { admin: true } };
});

export { onScanRequested, scanEvents } from "./scan";
