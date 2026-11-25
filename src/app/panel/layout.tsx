import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

// TODO(phase 4): require Firebase Auth with the `admin` claim before rendering.
export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink text-text-light">
      <header className="mx-auto box-border w-full max-w-[1360px] px-3.5 pt-4 lg:px-10 lg:pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/12 bg-white/5 py-2.5 pl-[18px] pr-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
              Solo panel de la manager
            </span>
            <span className="hidden text-sm text-text-subtle sm:inline">Vista previa del EPK</span>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="hit-44 rounded-full border border-white/18 px-4 py-[11px] text-sm font-medium text-text-light no-underline"
            >
              Ver sitio
            </Link>
            <button
              type="button"
              disabled
              title="Disponible en la fase de pitch"
              className="hit-44 cursor-not-allowed rounded-full bg-text-light px-[18px] py-[11px] text-sm font-semibold text-ink opacity-60"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
