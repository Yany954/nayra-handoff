import type { Metadata } from "next";
import { connection } from "next/server";
import { getShowsAdmin } from "@/application/panel";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { ShowsManager } from "@/presentation/components/panel/ShowsManager";
import { deleteShowAction, saveShowAction } from "./actions";

export const metadata: Metadata = { title: "Shows y fechas" };

export default async function ShowsPage() {
  await requireAdmin();
  await connection();
  const { rows } = await getShowsAdmin(adminRepositories(), toBogotaDateKey(new Date()));
  return (
    <>
      <PanelHeading title="Shows y fechas" />
      <ShowsManager rows={rows} save={saveShowAction} remove={deleteShowAction} />
    </>
  );
}
