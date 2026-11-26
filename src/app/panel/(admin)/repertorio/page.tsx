import type { Metadata } from "next";
import { nextOrder } from "@/application/panel";
import { SONG_GENRES } from "@/domain/entities";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { RecordList, type FieldDef } from "@/presentation/components/panel/RecordEditor";
import { deleteSongAction, saveSongAction } from "./actions";

export const metadata: Metadata = { title: "Repertorio" };

const FIELDS: FieldDef[] = [
  { name: "title", label: "Canción", kind: "text" },
  { name: "artist", label: "Artista", kind: "text" },
  { name: "genre", label: "Género", kind: "select", options: SONG_GENRES.map((g) => ({ value: g, label: g })) },
  { name: "order", label: "Posición", kind: "number" },
  {
    name: "key",
    label: "Tonalidad (opcional, privada)",
    kind: "text",
    placeholder: "Ej. La menor…",
    hint: "Solo la ves tú en el panel. Nunca aparece en el sitio. Déjala vacía si no quieres anotarla.",
    wide: true,
  },
  { name: "inMainShow", label: "Parte del show principal", kind: "checkbox" },
];

export default async function RepertoirePage() {
  await requireAdmin();
  const songs = await adminRepositories().listSongs();
  return (
    <>
      <PanelHeading title="Repertorio" />
      <RecordList
        noun="canción"
        fields={FIELDS}
        newValues={{ genre: "Vallenato", order: nextOrder(songs), inMainShow: false, key: "" }}
        save={saveSongAction}
        remove={deleteSongAction}
        empty="Todavía no hay canciones."
        intro={`${songs.length} canciones. Solo se ven aquí en el panel (el sitio público no muestra el repertorio).`}
        items={songs.map((song) => ({
          id: song.id,
          title: song.title,
          subtitle: song.artist,
          badges: [song.genre, ...(song.inMainShow ? ["Show principal"] : []), ...(song.key ? [`Tono: ${song.key}`] : [])],
          values: song,
        }))}
      />
    </>
  );
}
