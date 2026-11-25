import type { Metadata } from "next";
import { HOME_GALLERY_SIZE } from "@/application/public-site";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { GalleryManager } from "@/presentation/components/panel/GalleryManager";
import { PanelHeading } from "@/presentation/components/panel/PanelShell";
import { deletePhotoAction, movePhotoAction, updateAltAction, uploadPhotoAction } from "./actions";

export const metadata: Metadata = { title: "Galería" };

export default async function GalleryAdminPage() {
  await requireAdmin();
  const photos = await adminRepositories().listGallery();
  return (
    <>
      <PanelHeading title="Galería" />
      <GalleryManager
        photos={photos}
        homeCount={HOME_GALLERY_SIZE}
        upload={uploadPhotoAction}
        remove={deletePhotoAction}
        updateAlt={updateAltAction}
        move={movePhotoAction}
      />
    </>
  );
}
