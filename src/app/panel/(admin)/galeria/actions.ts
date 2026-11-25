"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { addGalleryPhoto, moveGalleryPhoto } from "@/application/panel";
import { requireAdmin } from "@/infrastructure/auth/session";
import { CONTENT_TAG, adminRepositories } from "@/infrastructure/container";
import { checkGalleryImage } from "@/infrastructure/schemas/image";
import { galleryAltSchema } from "@/infrastructure/schemas/panel";
import type { FormState } from "@/presentation/components/panel/form";

const docId = z.string().regex(/^[\w.-]{1,128}$/);
const invalid: FormState = { status: "error", message: "Foto inválida." };

export async function uploadPhotoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const file = formData.get("photo");
  const alt = galleryAltSchema.safeParse(formData.get("alt") ?? "");
  if (!(file instanceof File)) return { status: "error", fieldErrors: { photo: "Elige una foto." } };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = checkGalleryImage(bytes);
  if (!image.ok || !alt.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        ...(image.ok ? {} : { photo: image.message }),
        ...(alt.success ? {} : { alt: alt.error.issues[0]?.message ?? "Descripción inválida." }),
      },
    };
  }
  await addGalleryPhoto(adminRepositories(), {
    bytes,
    contentType: image.type,
    alt: alt.data,
  });
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Foto agregada al inicio de la galería." };
}

export async function updateAltAction(id: string, alt: string): Promise<FormState> {
  await requireAdmin();
  const parsed = galleryAltSchema.safeParse(alt);
  if (!docId.safeParse(id).success) return invalid;
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  await adminRepositories().updateGalleryAlt(id, parsed.data);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Descripción guardada." };
}

export async function deletePhotoAction(id: string): Promise<FormState> {
  await requireAdmin();
  if (!docId.safeParse(id).success) return invalid;
  await adminRepositories().deleteGalleryPhoto(id);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Foto borrada del sitio." };
}

export async function movePhotoAction(id: string, direction: -1 | 1): Promise<FormState> {
  await requireAdmin();
  if (!docId.safeParse(id).success || (direction !== -1 && direction !== 1)) return invalid;
  await moveGalleryPhoto(adminRepositories(), id, direction);
  updateTag(CONTENT_TAG);
  return { status: "ok", message: "Orden actualizado." };
}
