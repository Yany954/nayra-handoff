"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DiscoveredEvent } from "@/domain/entities";
import { FOUND_TYPE_LABELS } from "@/domain/rules/found";
import { primaryButton, secondaryButton, type FormState } from "@/presentation/components/panel/form";
import { longDate } from "@/presentation/components/panel/stages";

type Action = (id: string) => Promise<FormState>;

function FoundCard({ event, approve, discard, announce }: { event: DiscoveredEvent; approve: Action; discard: Action; announce: (s: FormState) => void }) {
  const [pending, startTransition] = useTransition();
  const run = (action: Action) => startTransition(async () => announce(await action(event.id)));
  return (
    <li className={`flex flex-col gap-3.5 rounded-[20px] border border-line-light bg-white p-[22px] ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-cream-soft px-2.5 py-[5px] text-xs font-semibold text-text-body">{FOUND_TYPE_LABELS[event.type] ?? "Otro"}</span>
        <span className="text-xs font-semibold tabular-nums text-text-body">Relevancia {Math.round(event.relevance * 100)}%</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="m-0 break-words font-display text-[21px] font-bold leading-[1.15]">{event.name}</h3>
        <span className="text-sm text-text-body">
          {[event.municipality, event.department].filter(Boolean).join(", ")} · {event.dates}
        </span>
      </div>
      {event.note && <p className="m-0 text-[13px] leading-normal text-muted-on-light">{event.note}</p>}
      {event.openCall && (
        <span className="self-start rounded-full bg-[#E3F0E6] px-2.5 py-1 text-xs font-semibold text-[#1F5130]">
          Convocatoria abierta{event.deadline ? ` · hasta ${longDate(event.deadline)}` : ""}
        </span>
      )}
      <span className="text-xs text-muted-on-light [overflow-wrap:anywhere]">
        Fuente:{" "}
        {event.url ? (
          <a href={event.url} target="_blank" rel="noopener noreferrer nofollow" className="text-text-dark underline">
            {event.sourceName || event.url}
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        ) : (
          event.sourceName || "sin enlace"
        )}
      </span>
      <div className="mt-auto flex gap-2">
        <button type="button" disabled={pending} onClick={() => run(approve)} className={`${primaryButton} flex-1`}>
          Agregar como Prospecto
        </button>
        <button type="button" disabled={pending} onClick={() => run(discard)} className={secondaryButton} aria-label={`Descartar ${event.name}`}>
          Descartar
        </button>
      </div>
    </li>
  );
}

export function FoundEvents({
  events,
  lastRun,
  nextRun,
  scanErrors,
  approve,
  discard,
  requestScan,
}: {
  events: DiscoveredEvent[];
  lastRun: string | null;
  nextRun: string | null;
  scanErrors: string[];
  approve: Action;
  discard: Action;
  requestScan: () => Promise<FormState>;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<FormState>({ status: "idle" });
  const [scanning, startScan] = useTransition();
  const pending = events.filter((e) => e.status === "pending");
  const reviewed = events.filter((e) => e.status !== "pending");

  function scanNow() {
    startScan(async () => {
      const result = await requestScan();
      setNotice(result);
      // The function runs in the background: look again a couple of times.
      if (result.status === "ok") for (const delay of [8_000, 25_000, 60_000]) setTimeout(() => router.refresh(), delay);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-text-dark px-5 py-4 text-text-light" data-theme="dark">
        <div className="flex items-center gap-2.5 text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <span>
            Búsqueda automática cada 3 días · {lastRun ? `última: ${lastRun}` : "todavía no ha corrido"}
            {nextRun && ` · próxima: ${nextRun}`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {["Cesar + Caribe", "Vallenato · Tambora · Ranchera", "Próx. 2 semanas – 6 meses"].map((chip) => (
            <span key={chip} className="rounded-full bg-white/12 px-2.5 py-[5px] text-xs">
              {chip}
            </span>
          ))}
          <button
            type="button"
            onClick={scanNow}
            disabled={scanning}
            className="ml-1 inline-flex min-h-11 cursor-pointer items-center rounded-full border-0 bg-accent px-4 text-sm font-semibold text-ink hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
          >
            {scanning ? "Pidiendo…" : "Buscar ahora"}
          </button>
        </div>
      </div>

      <p role={notice.status === "error" ? "alert" : "status"} className={`m-0 text-sm ${notice.status === "error" ? "font-medium text-[#8F2D1F]" : "text-[#1F5130]"}`}>
        {notice.message}
      </p>
      {scanErrors.length > 0 && (
        <details className="rounded-card-sm border border-[#E9C9A0] bg-[#FBEFD8] px-4 py-3 text-sm text-[#7A5108]">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">La última búsqueda tuvo {scanErrors.length} aviso(s)</summary>
          <ul className="m-0 mt-2 pl-5">
            {scanErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </details>
      )}

      {pending.length === 0 ? (
        <p className="m-0 rounded-[20px] border border-line-light bg-white p-6 text-muted-on-light">
          Nada por revisar. Cuando la búsqueda encuentre festivales, ferias o convocatorias, aparecen aquí para que decidas.
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3.5 p-0">
          {pending.map((event) => (
            <FoundCard key={event.id} event={event} approve={approve} discard={discard} announce={setNotice} />
          ))}
        </ul>
      )}

      {reviewed.length > 0 && (
        <details className="rounded-[20px] border border-line-light bg-white px-5 py-3">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">Revisados ({reviewed.length})</summary>
          <ul className="m-0 flex list-none flex-col p-0">
            {reviewed.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFE7DB] py-3 first:border-t-0">
                <span className="min-w-0 break-words">{event.name}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    event.status === "approved" ? "bg-[#E3F0E6] text-[#1F5130]" : "bg-[#EFEAE3] text-[#5A504A]"
                  }`}
                >
                  {event.status === "approved" ? "Agregado a Prospectos" : "Descartado"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
