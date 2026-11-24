import type { Metadata } from "next";
import Link from "next/link";
import { getRepertoirePage } from "@/application/public-site";
import { repositories } from "@/infrastructure/container";
import { RepertoireBrowser } from "@/presentation/components/repertoire/RepertoireBrowser";
import { Pill } from "@/presentation/ui/primitives";

export const metadata: Metadata = {
  title: "Repertorio",
  description: "Vallenato, rancheras, baladas, celebraciones y tambora en la voz de Nayra Lancheros.",
};

export default async function RepertoirePage() {
  const { songs, total, mainShowCount } = await getRepertoirePage(repositories);

  return (
    <main className="flex-1">
      <div className="mx-auto box-border flex max-w-[1360px] flex-wrap items-end justify-between gap-10 px-5 pb-14 pt-12 lg:px-12 lg:pb-[72px] lg:pt-20">
        <div className="flex min-w-0 flex-[1_1_100%] flex-col gap-4 lg:flex-[1_1_560px]">
          <div className="flex flex-wrap gap-2">
            <Pill className="bg-white/8 text-text-subtle">{total} canciones</Pill>
            <Pill className="bg-white/8 text-text-subtle">Show principal de {mainShowCount} temas</Pill>
          </div>
          <h1 className="m-0 font-display text-[60px] font-bold leading-[0.95] tracking-[-0.04em] sm:text-[84px] lg:text-[112px]">
            Repertorio
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-[1.55] text-text-subtle">
            Del vallenato clásico a las rancheras de celebración. Si tu evento necesita una canción especial, pregúntala.
          </p>
        </div>
        <Link
          href="/#contacto"
          className="flex min-h-[52px] items-center rounded-full bg-accent px-[22px] font-semibold text-ink no-underline"
        >
          Pedir una canción
        </Link>
      </div>
      <div className="bg-cream text-text-dark">
        <RepertoireBrowser songs={songs} />
      </div>
    </main>
  );
}
