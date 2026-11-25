import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { secondaryButton } from "@/presentation/components/panel/form";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { RecordForm, type FieldDef } from "@/presentation/components/panel/RecordEditor";
import { saveEpkAction } from "./actions";

export const metadata: Metadata = { title: "Editar EPK" };

const FIELDS: FieldDef[] = [
  { name: "eyebrow", label: "Encabezado", kind: "text", hint: "La línea pequeña sobre «EPK», ej. «Kit de prensa · 2026»." },
  { name: "rate", label: "Tarifa", kind: "text", hint: "Ej. «A convenir» o un rango." },
  { name: "intro", label: "Introducción", kind: "textarea", hint: "El párrafo junto a la foto principal." },
  { name: "bioShort", label: "Bio corta", kind: "textarea", hint: "También es la bio corta del sitio público." },
  { name: "base", label: "Ciudad base", kind: "text", hint: "También se usa en el sitio público." },
  { name: "genresSummary", label: "Géneros", kind: "text", hint: "Ej. Vallenato · Ranchera · Balada · Tambora." },
  { name: "coverageStat", label: "Cifra de cobertura", kind: "text", hint: "El número grande, ej. «13»." },
  { name: "coverageStatLabel", label: "Qué significa la cifra", kind: "text", hint: "Ej. «municipios»." },
  { name: "technicalRider", label: "Rider técnico", kind: "lines", hint: "Un punto por línea." },
  { name: "hospitalityRider", label: "Rider de hospitalidad y logística", kind: "lines", hint: "Un punto por línea." },
];

export default async function EditEpkPage() {
  await requireAdmin();
  const repos = adminRepositories();
  const [epk, profile] = await Promise.all([repos.getEpk(), repos.getProfile()]);
  return (
    <>
      <PanelHeading
        title="Editar EPK"
        eyebrow="Lo que ven los promotores en el EPK y el PDF"
        actions={
          <Link href="/panel/epk" className={secondaryButton}>
            Ver vista previa
          </Link>
        }
      />
      <p className="m-0 max-w-[680px] text-sm leading-normal text-muted-on-light">
        Los logros, formatos y fotos del EPK se editan en sus propias secciones. Aquí van los textos, la tarifa y los riders.
      </p>
      <div className="max-w-[860px] rounded-[20px] border border-line-light bg-white p-5 sm:p-7">
        <RecordForm
          fields={FIELDS}
          id={null}
          save={saveEpkAction}
          submitLabel="Guardar EPK"
          values={{ ...epk, bioShort: profile.bioShort, base: profile.base, genresSummary: profile.genresSummary }}
        />
      </div>
    </>
  );
}
