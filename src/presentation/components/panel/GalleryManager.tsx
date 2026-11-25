"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import type { GalleryPhoto } from "@/domain/entities";
import {
  Field,
  FormMessage,
  dangerButton,
  describedBy,
  fieldClass,
  initialFormState,
  primaryButton,
  secondaryButton,
  type FormState,
} from "@/presentation/components/panel/form";

type UploadAction = (prev: FormState, formData: FormData) => Promise<FormState>;
type IdAction = (id: string) => Promise<FormState>;
type AltAction = (id: string, alt: string) => Promise<FormState>;
type MoveAction = (id: string, direction: -1 | 1) => Promise<FormState>;

const DEFAULT_ALT = "Nayra Lancheros cantando en tarima";

function UploadForm({ upload }: { upload: UploadAction }) {
  const [preview, setPreview] = useState<string | null>(null);
  const showPreview = (file: File | undefined) =>
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
  // React resets the form after a successful action; the preview is cleared alongside it.
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await upload(prev, formData);
    if (result.status === "ok") showPreview(undefined);
    return result;
  }, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[20px] border border-line-light bg-white p-5 sm:p-6">
      <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">Subir foto</h2>
      <div className="flex flex-wrap gap-5">
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
          <Field label="Foto" name="photo" hint="JPG, PNG o WebP, hasta 10 MB. Aparece primero en la galería." error={errors.photo}>
            <input
              {...describedBy("photo", errors.photo, "x")}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) => showPreview(event.target.files?.[0])}
              className="min-h-12 cursor-pointer text-sm text-text-body file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border file:border-solid file:border-line-strong file:bg-cream file:px-4 file:text-sm file:font-medium file:text-text-dark"
            />
          </Field>
          <Field label="Descripción de la foto" name="alt" hint="Qué se ve en la foto. La leen quienes usan lector de pantalla y Google." error={errors.alt}>
            <textarea {...describedBy("alt", errors.alt, "x")} defaultValue={DEFAULT_ALT} rows={2} maxLength={200} className={`${fieldClass} resize-y py-3`} />
          </Field>
        </div>
        {preview && (
          // A local blob preview: next/image cannot optimize object URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa de la foto elegida" width={160} height={200} className="aspect-[4/5] w-40 rounded-card-sm object-cover" />
        )}
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={`${primaryButton} self-start`}>
        {pending ? "Subiendo…" : "Subir foto"}
      </button>
    </form>
  );
}

function PhotoCard({
  photo,
  index,
  total,
  onHome,
  actions,
  announce,
}: {
  photo: GalleryPhoto;
  index: number;
  total: number;
  onHome: boolean;
  actions: { remove: IdAction; updateAlt: AltAction; move: MoveAction };
  announce: (message: string) => void;
}) {
  const [alt, setAlt] = useState(photo.alt);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const altId = `alt-${photo.id}`;

  const run = (task: () => Promise<FormState>) =>
    startTransition(async () => {
      const result = await task();
      announce(result.message ?? "");
    });

  return (
    <li className={`flex flex-col overflow-hidden rounded-[20px] border border-line-light bg-white ${pending ? "opacity-60" : ""}`}>
      <div className="relative aspect-[4/5] bg-cream-deep">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[rgba(20,16,18,0.7)] px-2.5 py-1 text-xs font-semibold text-text-light">
          {index + 1}
          {onHome && " · En el inicio"}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-3.5">
        <label htmlFor={altId} className="sr-only">
          Descripción de la foto {index + 1}
        </label>
        <textarea
          id={altId}
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          rows={3}
          maxLength={200}
          className={`${fieldClass} resize-y py-2.5 text-sm`}
        />
        {alt.trim() !== photo.alt && (
          <button type="button" disabled={pending} onClick={() => run(() => actions.updateAlt(photo.id, alt))} className={primaryButton}>
            Guardar descripción
          </button>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || index === 0}
            onClick={() => run(() => actions.move(photo.id, -1))}
            aria-label={`Mover la foto ${index + 1} antes`}
            className={`${secondaryButton} min-w-11 px-0`}
          >
            ←
          </button>
          <button
            type="button"
            disabled={pending || index === total - 1}
            onClick={() => run(() => actions.move(photo.id, 1))}
            aria-label={`Mover la foto ${index + 1} después`}
            className={`${secondaryButton} min-w-11 px-0`}
          >
            →
          </button>
          {!confirming ? (
            <button type="button" onClick={() => setConfirming(true)} className={`${secondaryButton} ml-auto`}>
              Borrar
            </button>
          ) : (
            <span className="ml-auto flex gap-2">
              <button type="button" disabled={pending} onClick={() => run(() => actions.remove(photo.id))} className={dangerButton}>
                Sí, borrar
              </button>
              <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
                No
              </button>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function GalleryManager({
  photos,
  homeCount,
  upload,
  remove,
  updateAlt,
  move,
}: {
  photos: GalleryPhoto[];
  homeCount: number;
  upload: UploadAction;
  remove: IdAction;
  updateAlt: AltAction;
  move: MoveAction;
}) {
  const [notice, setNotice] = useState("");

  return (
    <>
      <UploadForm upload={upload} />
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">{photos.length} fotos en el sitio</h2>
        <p className="m-0 text-sm text-muted-on-light">Las primeras {homeCount} se ven en el inicio. Usa las flechas para cambiar el orden.</p>
      </div>
      <p role="status" className="m-0 min-h-[1.25em] text-sm text-[#1F5130]">
        {notice}
      </p>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            total={photos.length}
            onHome={index < homeCount}
            actions={{ remove, updateAlt, move }}
            announce={setNotice}
          />
        ))}
      </ul>
    </>
  );
}
