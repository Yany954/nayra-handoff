"use client";

type Gtag = (command: "event" | "config" | "js" | "consent", ...args: unknown[]) => void;

/** Sends a GA4 event only if the visitor accepted cookies (gtag exists only then). */
export function track(name: string, params: Record<string, string | number> = {}): void {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", name, params);
}

export const CONSENT_KEY = "nayra-cookie-consent";
export const OPEN_CONSENT_EVENT = "nayra:open-consent";
export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}
