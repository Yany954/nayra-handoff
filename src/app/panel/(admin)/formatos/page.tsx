import type { Metadata } from "next";
import { nextOrder } from "@/application/panel";
import { formatDuration } from "@/domain/rules/formats";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { RecordList, type FieldDef } from "@/presentation/components/panel/RecordEditor";
import { deleteFormatAction, saveFormatAction } from "./actions";

export const metadata: Metadata = { title: "Formatos" };

const FIELDS: FieldDef[] = [
  { name: "name", label: "Nombre", kind: "text", placeholder: "Ej. Voz y guitarra…" },
  { name: "shortName", label: "Nombre corto", kind: "text", hint: "Para listas compactas del EPK." },
  { name: "durationMin", label: "Duración mínima (min)", kind: "number" },
  { name: "durationMax", label: "Duración máxima (min)", kind: "number" },
  { name: "membersLabel", label: "Quiénes van", kind: "text", placeholder: "Ej. Voz + guitarra…" },
  { name: "membersCount", label: "Número de integrantes", kind: "number" },
  { name: "idealFor", label: "Ideal para", kind: "text", wide: true, placeholder: "Ej. Bodas, cenas y eventos íntimos…" },
  { name: "order", label: "Posición", kind: "number" },
];

export default async function FormatsPage() {
  await requireAdmin();
  const formats = await adminRepositories().listFormats();
  return (
    <>
      <PanelHeading title="Formatos" />
      <RecordList
        noun="formato"
        fields={FIELDS}
        newValues={{ order: nextOrder(formats), membersCount: 1, durationMin: 30, durationMax: 60 }}
        save={saveFormatAction}
        remove={deleteFormatAction}
        empty="Todavía no hay formatos."
        intro="Los formatos salen en el sitio y en los datos rápidos del EPK."
        items={formats.map((f) => ({
          id: f.id,
          title: f.name,
          subtitle: `${formatDuration(f)} · ${f.membersLabel} · ${f.idealFor}`,
          values: f,
        }))}
      />
    </>
  );
}
