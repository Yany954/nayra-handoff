import type { Metadata } from "next";
import { connection } from "next/server";
import { sortPromoters } from "@/application/panel";
import { PROMOTER_STAGES, type PromoterStage } from "@/domain/entities";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { PromotersBoard } from "@/presentation/components/panel/PromotersBoard";
import { deletePromoterAction, publishShowAction, savePromoterAction } from "./actions";

export const metadata: Metadata = { title: "Promotores" };

function isStage(value: unknown): value is PromoterStage {
  return typeof value === "string" && (PROMOTER_STAGES as readonly string[]).includes(value);
}

export default async function PromotersPage({ searchParams }: PageProps<"/panel/promotores">) {
  await requireAdmin();
  await connection();
  const params = await searchParams;
  const repos = adminRepositories();
  const [promoters, found] = await Promise.all([repos.listPromoters(), repos.listDiscoveredEvents()]);
  return (
    <>
      <PanelHeading title="Base de datos de shows" eyebrow="Promotores y eventos" />
      <PromotersBoard
        promoters={sortPromoters(promoters)}
        stage={isStage(params.etapa) ? params.etapa : null}
        view={params.vista === "encontrados" ? "encontrados" : "promotores"}
        today={toBogotaDateKey(new Date())}
        pendingFound={found.length}
        save={savePromoterAction}
        remove={deletePromoterAction}
        publish={publishShowAction}
      />
    </>
  );
}
