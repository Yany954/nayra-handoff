import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { sortPromoters } from "@/application/panel";
import { RECIPIENT_KINDS } from "@/domain/entities";
import { PITCH_VARIABLES, RECIPIENT_LABELS } from "@/domain/rules/pitch";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { PitchGenerator } from "@/presentation/components/panel/PitchGenerator";
import { RecordForm, type FieldDef } from "@/presentation/components/panel/RecordEditor";
import { markPitchSentAction, savePitchTemplatesAction } from "./actions";

export const metadata: Metadata = { title: "Pitch" };

const TEMPLATE_FIELDS: FieldDef[] = [
  ...RECIPIENT_KINDS.flatMap((k): FieldDef[] => [
    { name: `${k}_subject`, label: `${RECIPIENT_LABELS[k]}: asunto`, kind: "text", wide: true },
    { name: `${k}_paragraph`, label: `${RECIPIENT_LABELS[k]}: párrafo`, kind: "textarea", hint: "Reemplaza {parrafo_evento} en el cuerpo." },
  ]),
  { name: "body", label: "Cuerpo del correo (común a todos)", kind: "textarea", hint: "Usa {saludo}, {parrafo_evento} y {firma}." },
  { name: "signature", label: "Firma", kind: "textarea" },
];

function Tabs({ view }: { view: "generador" | "plantillas" }) {
  const tabs = [
    ["generador", "Generador", "/panel/pitch"],
    ["plantillas", "Plantillas", "/panel/pitch?vista=plantillas"],
  ] as const;
  return (
    <nav aria-label="Vista" className="flex max-w-full gap-1 self-start rounded-full bg-cream-deep p-1">
      {tabs.map(([id, label, href]) => (
        <Link
          key={id}
          href={href}
          aria-current={view === id ? "page" : undefined}
          className={`flex min-h-11 items-center rounded-full px-[18px] text-sm no-underline ${
            view === id ? "bg-white font-semibold text-text-dark" : "font-medium text-text-body hover:bg-white/60"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default async function PitchPage({ searchParams }: PageProps<"/panel/pitch">) {
  await requireAdmin();
  await connection();
  const params = await searchParams;
  const view = params.vista === "plantillas" ? "plantillas" : "generador";
  const repos = adminRepositories();
  const [templates, profile, formats, promoters] = await Promise.all([
    repos.getPitch(),
    repos.getProfile(),
    repos.listFormats(),
    repos.listPromoters(),
  ]);

  return (
    <>
      <PanelHeading title="Pitch" eyebrow="Correos a promotores" />
      <Tabs view={view} />
      {view === "generador" ? (
        <PitchGenerator
          templates={templates}
          profile={profile}
          formats={formats}
          promoters={sortPromoters(promoters.filter((p) => p.stage !== "descartado"))}
          initialPromoterId={typeof params.promotor === "string" ? params.promotor : null}
          markSent={markPitchSentAction}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <details className="max-w-[860px] rounded-card-sm border border-line-light bg-white p-5">
            <summary className="min-h-11 cursor-pointer content-center font-semibold">Variables que puedes usar</summary>
            <dl className="m-0 mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              {Object.entries(PITCH_VARIABLES).map(([name, description]) => (
                <div key={name} className="contents">
                  <dt className="font-mono font-semibold">{`{${name}}`}</dt>
                  <dd className="m-0 text-muted-on-light">{description}</dd>
                </div>
              ))}
            </dl>
          </details>
          <div className="max-w-[860px] rounded-[20px] border border-line-light bg-white p-5 sm:p-7">
            <RecordForm
              fields={TEMPLATE_FIELDS}
              id={null}
              save={savePitchTemplatesAction}
              submitLabel="Guardar plantillas"
              warnOnUnsaved
              values={{
                body: templates.body,
                signature: templates.signature,
                ...Object.fromEntries(
                  RECIPIENT_KINDS.flatMap((k) => [
                    [`${k}_subject`, templates.kinds[k].subject],
                    [`${k}_paragraph`, templates.kinds[k].paragraph],
                  ]),
                ),
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
