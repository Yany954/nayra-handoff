import type { Metadata } from "next";
import { nextOrder } from "@/application/panel";
import { HOME_SECONDARY_VIDEOS } from "@/application/public-site";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { RecordList, type FieldDef } from "@/presentation/components/panel/RecordEditor";
import { deleteVideoAction, saveVideoAction } from "./actions";

export const metadata: Metadata = { title: "Videos" };

const FIELDS: FieldDef[] = [
  { name: "title", label: "Título", kind: "text", wide: true, placeholder: "Ej. «Si no te tengo» en vivo…" },
  { name: "url", label: "Enlace", kind: "url", wide: true, placeholder: "https://youtu.be/… o https://www.instagram.com/reel/…", hint: "YouTube, Instagram, TikTok o Facebook." },
  { name: "context", label: "Dónde está", kind: "text", placeholder: "Ej. YouTube · @NAYRA-Lan…" },
  { name: "order", label: "Posición", kind: "number" },
  { name: "featured", label: "Video principal del sitio", kind: "checkbox", hint: "Si es de YouTube, se reproduce en el inicio. Marca solo uno." },
];

export default async function VideosPage() {
  await requireAdmin();
  const videos = await adminRepositories().listVideos();
  return (
    <>
      <PanelHeading title="Videos" />
      <RecordList
        noun="video"
        fields={FIELDS}
        newValues={{ order: nextOrder(videos), featured: false }}
        save={saveVideoAction}
        remove={deleteVideoAction}
        empty="Todavía no hay videos."
        intro={`El inicio muestra el principal y ${HOME_SECONDARY_VIDEOS} más; el PDF del EPK los lista todos con su enlace.`}
        items={videos.map((v) => ({
          id: v.id,
          title: v.title,
          subtitle: `${v.context} · ${v.url}`,
          badges: v.featured ? ["Principal"] : [],
          values: v,
        }))}
      />
    </>
  );
}
