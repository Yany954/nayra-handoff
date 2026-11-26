import Link from "next/link";
import type { ReactNode } from "react";
import type { PanelSummary } from "@/domain/rules/promoters";
import { STAGE_LABELS } from "@/domain/rules/promoters";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { STAGE_STYLES, daysBetween, shortDate } from "@/presentation/components/panel/stages";

const card = "flex flex-col gap-4 rounded-[20px] border border-line-light bg-white p-5 sm:p-6";

function Card({ title, count, href, linkLabel, children }: { title: string; count: number; href?: string; linkLabel?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
        <span className="rounded-full bg-cream-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-text-body">{count}</span>
      </div>
      {children}
      {href && (
        <Link href={href} className="hit-44 mt-auto self-start text-sm font-medium text-text-dark underline underline-offset-4 hover:text-text-body">
          {linkLabel}
        </Link>
      )}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="m-0 text-sm leading-normal text-muted-on-light">{children}</p>;
}

function dueLabel(date: string, today: string) {
  const late = daysBetween(date, today);
  if (late <= 0) return "Hoy";
  return late === 1 ? "Venció ayer" : `Venció hace ${late} días`;
}

export function PanelHome({
  summary,
  adminName,
  today,
  markReviewed,
  analytics,
}: {
  summary: PanelSummary;
  adminName: string;
  today: string;
  markReviewed: (id: string) => Promise<void>;
  analytics: ReactNode;
}) {
  const firstName = adminName.split(" ")[0];

  return (
    <>
      <PanelHeading eyebrow={`Hola, ${firstName}`} title="Inicio" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {summary.stageCounts.map(({ stage, label, count }) => (
          <div key={stage} className="flex flex-col gap-2.5 rounded-card-sm border border-line-light bg-white p-[18px]">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: STAGE_STYLES[stage].dot }} />
              <span className="text-[13px] font-medium text-text-body">{label}</span>
            </div>
            <span className="font-display text-[34px] font-bold tabular-nums">{count}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
        <Card title="Pendientes" count={summary.dueFollowUps.length} href="/panel/promotores" linkLabel="Ver promotores">
          {summary.dueFollowUps.length === 0 ? (
            <Empty>No hay seguimientos para hoy. Cuando marques un promotor como «Contactado», el recordatorio aparece aquí a los 7 días.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {summary.dueFollowUps.slice(0, 6).map((p) => {
                const style = STAGE_STYLES[p.stage];
                return (
                  <li key={p.id} className="flex flex-col gap-1 border-t border-[#EFE7DB] py-3 first:border-t-0 first:pt-0">
                    <span className="font-semibold">{p.name}</span>
                    <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted-on-light">
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: style.bg, color: style.fg }}>
                        {STAGE_LABELS[p.stage]}
                      </span>
                      {p.city}
                      {p.contact && ` · ${p.contact}`}
                    </span>
                    <span className={`text-[13px] font-medium ${p.nextFollowUpAt < today ? "text-[#8F2D1F]" : "text-text-body"}`}>
                      {dueLabel(p.nextFollowUpAt, today)} · {shortDate(p.nextFollowUpAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Solicitudes nuevas" count={summary.newRequests.length}>
          {summary.newRequests.length === 0 ? (
            <Empty>Sin solicitudes nuevas. Aquí llegará lo que la gente envíe desde el formulario de contacto del sitio.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {summary.newRequests.slice(0, 6).map((r) => (
                <li key={r.id} className="flex flex-col gap-1 border-t border-[#EFE7DB] py-3 first:border-t-0 first:pt-0">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-[13px] text-muted-on-light">
                    {r.eventType} · {r.municipality}
                    {r.eventDate && ` · ${shortDate(r.eventDate)}`}
                  </span>
                  <span className="flex flex-wrap gap-3 pt-1">
                    <Link href="/panel/promotores?etapa=prospecto" className="hit-44 text-sm font-medium text-text-dark underline underline-offset-4">
                      Ver como prospecto
                    </Link>
                    <form action={markReviewed.bind(null, r.id)}>
                      <button type="submit" className="hit-44 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-text-body underline underline-offset-4">
                        Marcar revisada<span className="sr-only">: {r.name}</span>
                      </button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Eventos encontrados" count={summary.pendingEvents.length} href="/panel/promotores?vista=encontrados" linkLabel="Ver encontrados">
          {summary.pendingEvents.length === 0 ? (
            <Empty>Nada por revisar. La búsqueda automática de festivales y ferias dejará aquí lo que encuentre para que lo apruebes.</Empty>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {summary.pendingEvents.slice(0, 6).map((e) => (
                <li key={e.id} className="flex flex-col gap-0.5 border-t border-[#EFE7DB] py-3 first:border-t-0 first:pt-0">
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-[13px] text-muted-on-light">
                    {e.municipality} · {e.dates} · Relevancia {Math.round(e.relevance * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {analytics}
    </>
  );
}
