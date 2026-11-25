import type { Metadata } from "next";
import { nextOrder } from "@/application/panel";
import { ACHIEVEMENT_KINDS, type AchievementKind } from "@/domain/entities";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { RecordList, type FieldDef } from "@/presentation/components/panel/RecordEditor";
import { deleteAchievementAction, saveAchievementAction } from "./actions";

export const metadata: Metadata = { title: "Logros" };

const KIND_LABELS: Record<AchievementKind, string> = {
  ganadora: "Ganadora",
  finalista: "Finalista",
  participante: "Participante",
  tarima: "Tarima compartida",
  reconocimiento: "Reconocimiento",
};

const FIELDS: FieldDef[] = [
  { name: "title", label: "Logro", kind: "text", placeholder: "Ej. 1.er lugar…" },
  { name: "kind", label: "Tipo", kind: "select", options: ACHIEVEMENT_KINDS.map((k) => ({ value: k, label: KIND_LABELS[k] })) },
  { name: "subtitle", label: "Detalle", kind: "text", wide: true, placeholder: "Ej. Concurso Caribe Canta · Barranquilla…" },
  { name: "label", label: "Etiqueta corta", kind: "text", hint: "La palabra en la pastilla del sitio, ej. «Ganadora»." },
  { name: "order", label: "Posición", kind: "number", hint: "1 aparece primero." },
  { name: "epkLine", label: "Línea para el EPK", kind: "text", wide: true, hint: "Así aparece en la lista de logros del EPK y el PDF." },
  { name: "featured", label: "Destacar en el inicio del sitio", kind: "checkbox", hint: "Los destacados salen en tarjetas grandes." },
];

export default async function AchievementsPage() {
  await requireAdmin();
  const achievements = await adminRepositories().listAchievements();
  return (
    <>
      <PanelHeading title="Logros" />
      <RecordList
        noun="logro"
        fields={FIELDS}
        newValues={{ kind: "ganadora", order: nextOrder(achievements), featured: false }}
        save={saveAchievementAction}
        remove={deleteAchievementAction}
        empty="Todavía no hay logros."
        intro="Los logros salen en el inicio del sitio y en el EPK."
        items={achievements.map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          badges: [KIND_LABELS[a.kind], ...(a.featured ? ["Destacado en el inicio"] : [])],
          values: a,
        }))}
      />
    </>
  );
}
