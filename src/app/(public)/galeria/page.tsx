import type { Metadata } from "next";
import { getGalleryPage } from "@/application/public-site";
import { repositories } from "@/infrastructure/container";
import { GalleryGrid } from "@/presentation/components/gallery/GalleryGrid";
import { Pill } from "@/presentation/ui/primitives";

export const metadata: Metadata = {
  title: "Galería",
  description: "Fotos de Nayra Lancheros en tarima, festivales y muestras folclóricas.",
};

export default async function GalleryPage() {
  const { photos } = await getGalleryPage(repositories);

  return (
    <main className="mx-auto box-border flex w-full max-w-[1360px] flex-1 flex-col gap-10 px-5 pb-20 pt-12 lg:px-12 lg:pb-[120px] lg:pt-20">
      <div className="flex flex-col gap-4">
        <div className="flex">
          <Pill className="bg-white/8 text-text-subtle">{photos.length} fotos</Pill>
        </div>
        <h1 className="m-0 font-display text-[60px] font-bold leading-[0.95] tracking-[-0.04em] sm:text-[84px] lg:text-[112px]">
          Galería
        </h1>
      </div>
      <GalleryGrid photos={photos} />
    </main>
  );
}
