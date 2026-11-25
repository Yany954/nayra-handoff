"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PROMOTER_STAGES, type Promoter, type PromoterStage } from "@/domain/entities";
import { STAGE_LABELS } from "@/domain/rules/promoters";
import { primaryButton, secondaryButton, type FormState } from "@/presentation/components/panel/form";
import { toCsv } from "@/presentation/components/panel/csv";
import {
  ConfirmDelete,
  RecordDialog,
  RecordForm,
  useRecordDialog,
  type DeleteAction,
  type FieldDef,
  type SaveAction,
} from "@/presentation/components/panel/RecordEditor";
import { STAGE_STYLES, longDate, shortDate } from "@/presentation/components/panel/stages";

const SOURCE_LABELS: Record<Promoter["source"], string> = { auto: "Auto", manual: "Manual", web_form: "Formulario web" };
const TYPES = ["Festival", "Feria", "Fiestas patronales", "Alcaldía / Casa de cultura", "Hotel", "Corporativo", "Evento privado", "Colegio", "Otro"];

const FIELDS: FieldDef[] = [
  { name: "name", label: "Nombre del lugar o evento", kind: "text", wide: true },
  { name: "type", label: "Tipo", kind: "select", options: TYPES.map((t) => ({ value: t, label: t })) },
  { name: "city", label: "Ciudad", kind: "text", placeholder: "Ej. Valledupar…" },
  { name: "contact", label: "Contacto", kind: "text", placeholder: "Correo, teléfono o persona…" },
  { name: "socialOrWeb", label: "Red social o web", kind: "text", placeholder: "Ej. @festival…" },
  { name: "stage", label: "Etapa", kind: "select", options: PROMOTER_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] })) },
  {
    name: "nextFollowUpAt",
    label: "Próximo seguimiento",
    kind: "date",
    hint: "Al pasar a «Contactado» se pone sola a 7 días; puedes cambiarla.",
  },
  { name: "eventDate", label: "Fecha del evento", kind: "date" },
  { name: "notes", label: "Notas", kind: "textarea" },
];

type View = "promotores" | "encontrados";

function href(view: View, stage: PromoterStage | null) {
  const params = new URLSearchParams();
  if (view === "encontrados") params.set("vista", "encontrados");
  if (stage) params.set("etapa", stage);
  const query = params.toString();
  return `/panel/promotores${query ? `?${query}` : ""}`;
}

function StageBadge({ stage }: { stage: PromoterStage }) {
  const style = STAGE_STYLES[stage];
  return (
    <span className="whitespace-nowrap rounded-full px-2.5 py-[5px] text-xs font-semibold" style={{ background: style.bg, color: style.fg }}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

function downloadCsv(promoters: readonly Promoter[]) {
  const csv = toCsv(
    ["Tipo", "Nombre", "Ciudad", "Contacto", "Red social / web", "Etapa", "Último contacto", "Próx. seguimiento", "Fecha del evento", "Fuente", "Notas"],
    promoters.map((p) => [
      p.type, p.name, p.city, p.contact, p.socialOrWeb, STAGE_LABELS[p.stage],
      p.lastContactAt, p.nextFollowUpAt, p.eventDate, SOURCE_LABELS[p.source], p.notes,
    ]),
  );
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `promotores-${new Date().toISOString().slice(0, 10)}.csv` });
  link.click();
  URL.revokeObjectURL(url);
}

export function PromotersBoard({
  promoters,
  stage,
  view,
  today,
  pendingFound,
  save,
  remove,
  publish,
}: {
  promoters: Promoter[];
  stage: PromoterStage | null;
  view: View;
  today: string;
  pendingFound: number;
  save: SaveAction;
  remove: DeleteAction;
  publish: (id: string) => Promise<FormState>;
}) {
  const dialog = useRecordDialog();
  const [notice, setNotice] = useState("");
  const [publishing, startPublish] = useTransition();
  const shown = stage ? promoters.filter((p) => p.stage === stage) : promoters;
  const counts = PROMOTER_STAGES.map((s) => ({ stage: s, count: promoters.filter((p) => p.stage === s).length }));

  const edit = (p: Promoter | null) => {
    setNotice("");
    dialog.open(p?.id ?? null, p ?? { type: "Festival", stage: "prospecto" });
  };
  const followUp = (p: Promoter) =>
    p.nextFollowUpAt ? (
      <span className={p.nextFollowUpAt <= today && (p.stage === "contactado" || p.stage === "en_negociacion") ? "font-semibold text-[#8F2D1F]" : ""}>
        {shortDate(p.nextFollowUpAt)}
      </span>
    ) : (
      "—"
    );
  const actions = (p: Promoter, compact = false) => (
    <div className={`flex gap-2 ${compact ? "flex-nowrap" : "flex-wrap"}`}>
      <button type="button" onClick={() => edit(p)} aria-label={`Editar ${p.name}`} className={secondaryButton}>
        Editar
      </button>
      {p.stage === "cerrado" && (
        <button
          type="button"
          disabled={publishing}
          onClick={() => startPublish(async () => setNotice((await publish(p.id)).message ?? ""))}
          className={secondaryButton}
        >
          Publicar como show
        </button>
      )}
      <ConfirmDelete label={p.name} onConfirm={async () => setNotice((await remove(p.id)).message ?? "")} />
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => downloadCsv(promoters)} className={secondaryButton} disabled={promoters.length === 0}>
          Exportar a Excel
        </button>
        <button type="button" onClick={() => edit(null)} className={primaryButton}>
          + Agregar promotor
        </button>
        <p role="status" className="m-0 text-sm text-[#1F5130] sm:ml-2">
          {notice}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {counts.map(({ stage: s, count }) => (
          <div key={s} className="flex flex-col gap-2.5 rounded-card-sm border border-line-light bg-white p-[18px]">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: STAGE_STYLES[s].dot }} />
              <span className="text-[13px] font-medium text-text-body">{STAGE_LABELS[s]}</span>
            </div>
            <span className="font-display text-[34px] font-bold tabular-nums">{count}</span>
          </div>
        ))}
      </div>

      <nav aria-label="Vista" className="flex gap-1 self-start rounded-full bg-cream-deep p-1">
        {(
          [
            ["promotores", "Promotores", promoters.length],
            ["encontrados", "Encontrados automáticamente", pendingFound],
          ] as const
        ).map(([id, label, count]) => (
          <Link
            key={id}
            href={href(id, null)}
            aria-current={view === id ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm no-underline sm:px-[18px] ${
              view === id ? "bg-white font-semibold text-text-dark" : "font-medium text-text-body hover:bg-white/60"
            }`}
          >
            {label}
            <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${view === id ? "bg-cream-soft" : "bg-cream"}`}>{count}</span>
          </Link>
        ))}
      </nav>

      {view === "encontrados" ? (
        <div className="flex flex-col gap-2 rounded-[18px] bg-text-dark p-5 text-text-light">
          <span className="font-semibold">Búsqueda automática: aún no está activa</span>
          <span className="text-sm leading-normal text-muted-on-dark">
            Cuando se active, buscará cada 3 días festivales, ferias y fiestas del Cesar y el Caribe, y los dejará aquí para que los
            apruebes como Prospecto o los descartes. Nada entra a tu base sin tu aprobación.
          </span>
        </div>
      ) : (
        <>
          <div role="group" aria-label="Filtrar por etapa" className="flex flex-wrap gap-2">
            {[null, ...PROMOTER_STAGES].map((s) => {
              const on = s === stage;
              return (
                <Link
                  key={s ?? "todas"}
                  href={href("promotores", s)}
                  aria-current={on ? "true" : undefined}
                  className={`flex min-h-11 items-center rounded-full px-4 text-[13px] no-underline ${
                    on ? "bg-text-dark font-semibold text-text-light" : "border border-line-light bg-white font-medium text-text-dark hover:border-text-dark"
                  }`}
                >
                  {s ? STAGE_LABELS[s] : "Todas"}
                </Link>
              );
            })}
          </div>

          {shown.length === 0 ? (
            <p className="m-0 rounded-[20px] border border-line-light bg-white p-6 text-muted-on-light">
              {stage ? `No hay promotores en «${STAGE_LABELS[stage]}».` : "Todavía no hay promotores. Agrega el primero."}
            </p>
          ) : (
            <>
              {/* Desktop: the table from Panel.dc.html. */}
              <div className="hidden overflow-x-auto rounded-[20px] border border-line-light bg-white lg:block">
                <table className="w-full min-w-[1040px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F8F4EC] text-left">
                      {["Tipo", "Nombre del lugar / evento", "Ciudad", "Contacto", "Red social / web", "Etapa", "Próx. seguimiento", "Fuente", "Acciones"].map((h) => (
                        <th key={h} scope="col" className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-on-light">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((p) => (
                      <tr key={p.id} className="border-t border-[#EFE7DB] align-top">
                        <td className="px-4 py-3.5">
                          <span className="whitespace-nowrap rounded-full bg-cream-soft px-2.5 py-[5px] text-xs font-semibold text-text-body">{p.type}</span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold">
                          {p.name}
                          {p.eventDate && <span className="block text-xs font-normal text-muted-on-light">Evento: {longDate(p.eventDate)}</span>}
                        </td>
                        <td className="px-4 py-3.5 text-text-body">{p.city || "—"}</td>
                        <td className="max-w-[200px] px-4 py-3.5 text-text-body [overflow-wrap:anywhere]">{p.contact || "—"}</td>
                        <td className="max-w-[180px] px-4 py-3.5 text-text-body [overflow-wrap:anywhere]">{p.socialOrWeb || "—"}</td>
                        <td className="px-4 py-3.5">
                          <StageBadge stage={p.stage} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-text-body tabular-nums">{followUp(p)}</td>
                        <td className="px-4 py-3.5 text-[13px] text-muted-on-light">{SOURCE_LABELS[p.source]}</td>
                        <td className="px-4 py-2">{actions(p, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phones: one card per promoter. */}
              <ul className="m-0 flex list-none flex-col gap-3 p-0 lg:hidden">
                {shown.map((p) => (
                  <li key={p.id} className="flex flex-col gap-2.5 rounded-[20px] border border-line-light bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StageBadge stage={p.stage} />
                      <span className="rounded-full bg-cream-soft px-2.5 py-[5px] text-xs font-semibold text-text-body">{p.type}</span>
                    </div>
                    <span className="break-words font-display text-lg font-bold">{p.name}</span>
                    <span className="break-words text-sm text-text-body">
                      {[p.city, p.contact, p.socialOrWeb].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                    </span>
                    <span className="text-[13px] text-muted-on-light">
                      Seguimiento: {followUp(p)} · {SOURCE_LABELS[p.source]}
                    </span>
                    {actions(p)}
                  </li>
                ))}
              </ul>
            </>
          )}
          <span className="text-[13px] text-muted-on-light">
            Los cambios se guardan en Firestore. Lo marcado «Cerrado» puede publicarse como show en el sitio con un clic.
          </span>
        </>
      )}

      <RecordDialog dialogRef={dialog.ref} onClosed={dialog.reset} title={dialog.current?.id ? "Editar promotor" : "Agregar promotor"}>
        {dialog.current && (
          <RecordForm
            key={dialog.current.key}
            fields={FIELDS}
            values={dialog.current.values}
            id={dialog.current.id}
            save={save}
            onSaved={(state) => {
              setNotice(state.message ?? "");
              dialog.close();
            }}
            onCancel={dialog.close}
          />
        )}
      </RecordDialog>
    </>
  );
}
