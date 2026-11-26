"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CONSENT_KEY, OPEN_CONSENT_EVENT, readConsent, track, type Consent } from "./track";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Loads gtag.js once. Called only after the visitor clicks «Aceptar». */
function loadGoogleAnalytics(id: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true, send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/** What matters for booking: who tried to contact her, not just who looked. */
function onDocumentClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.("a");
  const href = link?.getAttribute("href") ?? "";
  if (href.includes("wa.me/")) track("contact_whatsapp");
  else if (href.endsWith("#contacto")) track("contact_cta", { label: (link?.textContent ?? "").trim().slice(0, 40) });
}

const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};

/**
 * Cookie notice (Ley 1581) + Google Analytics. Nothing from Google loads until «Aceptar».
 * Not a modal: it never traps focus and the page reserves room for it so it covers nothing.
 */
export function Analytics({ measurementId }: { measurementId: string | null }) {
  const stored = useSyncExternalStore(subscribe, readConsent, () => "denied" as Consent | null);
  const [reopened, setReopened] = useState(false);
  const [choice, setChoice] = useState<Consent | null>(null);
  const consent = choice ?? stored;
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const visible = Boolean(measurementId) && (consent === null || reopened);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  useEffect(() => {
    if (!measurementId || consent !== "granted") return;
    loadGoogleAnalytics(measurementId);
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [measurementId, consent]);

  useEffect(() => {
    if (consent === "granted") track("page_view", { page_path: pathname, page_location: window.location.href });
  }, [consent, pathname]);

  // Keep focused elements clear of the fixed banner (WCAG 2.4.11).
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingBottom = visible ? `${(bannerRef.current?.offsetHeight ?? 0) + 16}px` : "";
    document.body.style.paddingBottom = visible ? `${bannerRef.current?.offsetHeight ?? 0}px` : "";
  }, [visible]);

  const decide = useCallback((value: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Private mode: the choice lasts for this visit only.
    }
    setChoice(value);
    setReopened(false);
    // Rejecting after accepting: stop now and on the next visit (gtag is gone after a reload).
    if (value === "denied" && window.gtag) window.location.reload();
  }, []);

  if (!visible) return null;
  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Aviso de cookies"
      data-theme="dark"
      onKeyDown={(e) => e.key === "Escape" && setReopened(false)}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-[rgba(15,12,14,0.97)] px-5 py-4 text-text-light pb-[max(16px,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3">
        <p className="m-0 max-w-[760px] text-sm leading-normal text-text-soft">
          Usamos Google Analytics para saber cuántas personas visitan el sitio, solo si lo aceptas.{" "}
          <Link href="/privacidad" className="text-text-light underline">
            Más información
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="min-h-11 cursor-pointer rounded-full border border-white/40 bg-transparent px-5 text-sm font-medium text-text-light hover:border-white/70"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="min-h-11 cursor-pointer rounded-full border-0 bg-text-light px-5 text-sm font-semibold text-ink hover:bg-text-soft"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link to change the decision later. */
export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="hit-44 cursor-pointer border-0 bg-transparent p-0 text-sm text-muted-on-dark underline hover:text-text-light"
    >
      Preferencias de cookies
    </button>
  );
}
