import type { Metadata } from "next";
import { connection } from "next/server";
import { getPanelHome } from "@/application/panel";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHome } from "@/presentation/components/panel/PanelHome";
import { markRequestReviewedAction } from "./solicitudes-actions";

export const metadata: Metadata = { title: "Inicio" };

export default async function PanelHomePage() {
  const admin = await requireAdmin();
  // "Today" must be computed per request, never during a prefetch or prerender.
  await connection();
  const today = toBogotaDateKey(new Date());
  const summary = await getPanelHome(adminRepositories(), today);
  return (
    <PanelHome
      summary={summary}
      adminName={admin.name}
      today={today}
      markReviewed={markRequestReviewedAction}
      analytics={
        <section aria-label="Visitas del sitio" className="flex flex-col gap-2 rounded-[20px] bg-text-dark p-5 text-text-light sm:p-6" data-theme="dark">
          <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">Visitas del sitio</h2>
          <p className="m-0 max-w-[640px] text-sm leading-normal text-muted-on-dark">
            El sitio ya está publicado. Las estadísticas se están conectando: pronto verás aquí las visitas de la semana, las páginas
            más vistas y cuántas personas tocaron WhatsApp o «Contrátala».
          </p>
        </section>
      }
    />
  );
}
