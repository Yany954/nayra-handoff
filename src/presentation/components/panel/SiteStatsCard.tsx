import type { SiteStats } from "@/domain/entities";

const PAGE_NAMES: Record<string, string> = { "/": "Inicio", "/repertorio": "Repertorio", "/galeria": "Galería", "/privacidad": "Privacidad" };

function Delta({ now, before }: { now: number; before: number }) {
  if (before === 0) return null;
  const change = Math.round(((now - before) / before) * 100);
  const word = change > 0 ? `${change}% más` : change < 0 ? `${-change}% menos` : "igual";
  return <span className="text-xs text-muted-on-dark">{word} que la semana anterior</span>;
}

const REASONS = {
  not_configured: "Falta conectar Google Analytics (GA_PROPERTY_ID). Las visitas ya se están midiendo en el sitio.",
  no_access: "La cuenta del servidor todavía no tiene acceso de lector a Google Analytics.",
  error: "No pudimos leer Google Analytics en este momento. Vuelve a intentarlo más tarde.",
} as const;

export function SiteStatsCard({ result }: { result: { ok: true; stats: SiteStats } | { ok: false; reason: keyof typeof REASONS } }) {
  return (
    <section aria-labelledby="stats-title" data-theme="dark" className="flex flex-col gap-4 rounded-[20px] bg-text-dark p-5 text-text-light sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="stats-title" className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">
          Visitas del sitio
        </h2>
        <span className="text-xs text-muted-on-dark">Últimos 7 días · solo quienes aceptaron cookies</span>
      </div>
      {!result.ok ? (
        <p className="m-0 max-w-[640px] text-sm leading-normal text-muted-on-dark">{REASONS[result.reason]}</p>
      ) : (
        <>
          <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ["Visitantes", result.stats.visitors, <Delta key="d" now={result.stats.visitors} before={result.stats.visitorsBefore} />],
              ["Páginas vistas", result.stats.views, <Delta key="d" now={result.stats.views} before={result.stats.viewsBefore} />],
              ["Clics en WhatsApp", result.stats.whatsappClicks, null],
              ["Clics en «Contrátala»", result.stats.contactClicks, null],
              ["Formularios enviados", result.stats.leads, null],
            ].map(([label, value, delta]) => (
              <div key={String(label)} className="flex flex-col gap-1 rounded-card-sm bg-white/[0.06] p-3.5">
                <dt className="text-xs text-muted-on-dark">{label}</dt>
                <dd className="m-0 font-display text-[28px] font-bold tabular-nums">{value}</dd>
                {delta}
              </div>
            ))}
          </dl>
          {result.stats.topPages.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <h3 className="m-0 text-sm font-semibold text-text-subtle">Páginas más vistas</h3>
              <ol className="m-0 flex flex-col gap-1 pl-5 text-sm text-text-soft">
                {result.stats.topPages.map((p) => (
                  <li key={p.path}>
                    {PAGE_NAMES[p.path] ?? p.path} · <span className="tabular-nums">{p.views}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </section>
  );
}
