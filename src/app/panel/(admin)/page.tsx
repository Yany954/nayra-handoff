import type { Metadata } from "next";
import { connection } from "next/server";
import { getPanelHome } from "@/application/panel";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { getSiteStats } from "@/infrastructure/analytics/ga";
import { PanelHome } from "@/presentation/components/panel/PanelHome";
import { SiteStatsCard } from "@/presentation/components/panel/SiteStatsCard";
import { markRequestReviewedAction } from "./solicitudes-actions";

export const metadata: Metadata = { title: "Inicio" };

export default async function PanelHomePage() {
  const admin = await requireAdmin();
  // "Today" must be computed per request, never during a prefetch or prerender.
  await connection();
  const today = toBogotaDateKey(new Date());
  const [summary, stats] = await Promise.all([getPanelHome(adminRepositories(), today), getSiteStats()]);
  return (
    <PanelHome
      summary={summary}
      adminName={admin.name}
      today={today}
      markReviewed={markRequestReviewedAction}
      analytics={<SiteStatsCard result={stats} />}
    />
  );
}
