"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { CloseIcon, MenuIcon } from "@/presentation/ui/icons";

const LINKS = [
  { href: "/", label: "Inicio", route: "/" },
  { href: "/repertorio", label: "Repertorio", route: "/repertorio" },
  { href: "/#shows", label: "Shows" },
  { href: "/epk", label: "EPK", route: "/epk" },
  { href: "/#contacto", label: "Contacto" },
];

function Logo({ name, compact = false }: { name: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`hit-44 flex items-center font-display font-bold text-text-light no-underline ${
        compact ? "gap-2 text-base" : "gap-2.5 text-lg"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-accent text-ink ${
          compact ? "size-[26px] text-[13px]" : "size-[30px] text-[15px]"
        }`}
      >
        {name.charAt(0)}
      </span>
      {name}
    </Link>
  );
}

export function SiteNav({ name }: { name: string }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDialogElement>(null);
  const isHome = pathname === "/";
  const isEpk = pathname === "/epk";
  const closeMenu = () => menuRef.current?.close();

  return (
    <header
      className={`z-30 mx-auto box-border w-full max-w-[1360px] lg:static lg:px-10 lg:pt-5 ${
        isHome ? "absolute inset-x-0 top-0 px-3.5 pt-4" : "relative px-3.5 pt-4"
      }`}
    >
      <nav
        aria-label="Principal"
        className="hidden items-center justify-between gap-4 rounded-full border border-white/12 bg-white/5 py-2.5 pl-[18px] pr-3 lg:flex"
      >
        <Logo name={name} />
        <div className="flex flex-wrap gap-1">
          {LINKS.map((link) => {
            const active = link.route === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`hit-44 rounded-full px-3.5 py-2.5 text-sm no-underline ${
                  active ? "bg-white/10 text-text-light" : "text-text-subtle hover:text-text-light"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-2">
          {isEpk ? (
            <button
              type="button"
              disabled
              title="Disponible próximamente"
              className="hit-44 cursor-not-allowed rounded-full bg-text-light px-[18px] py-[11px] text-sm font-semibold text-ink opacity-60"
            >
              Descargar PDF
            </button>
          ) : (
            <>
              <Link
                href="/epk"
                className="hit-44 rounded-full border border-white/18 px-4 py-[11px] text-sm font-medium text-text-light no-underline"
              >
                Descargar EPK
              </Link>
              <Link
                href="/#contacto"
                className="hit-44 rounded-full bg-text-light px-[18px] py-[11px] text-sm font-semibold text-ink no-underline"
              >
                Contrátala
              </Link>
            </>
          )}
        </div>
      </nav>

      <nav
        aria-label="Principal móvil"
        className="flex items-center justify-between rounded-full border border-white/14 bg-[rgba(20,16,18,0.55)] py-2 pl-3.5 pr-2 backdrop-blur-md lg:hidden"
      >
        <Logo name={name} compact />
        <div className="flex items-center gap-1.5">
          <Link
            href="/#contacto"
            className="hit-44 flex min-h-9 items-center rounded-full bg-text-light px-3.5 text-[13px] font-semibold text-ink no-underline"
          >
            Contrátala
          </Link>
          <button
            type="button"
            aria-label="Abrir menú"
            aria-haspopup="dialog"
            onClick={() => menuRef.current?.showModal()}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-text-light"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      <dialog
        ref={menuRef}
        aria-label="Menú"
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-ink p-0 text-text-light backdrop:bg-ink open:flex open:flex-col lg:hidden"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="font-display text-lg font-bold">{name}</span>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMenu}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-text-light"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 px-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={link.route === pathname ? "page" : undefined}
              className={`flex min-h-14 items-center font-display text-[40px] font-bold tracking-[-0.03em] no-underline ${
                link.route === pathname ? "text-accent" : "text-text-light"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="p-5">
          <Link
            href="/#contacto"
            onClick={closeMenu}
            className="flex min-h-[52px] items-center justify-center rounded-full bg-text-light font-semibold text-ink no-underline"
          >
            Contrátala
          </Link>
        </div>
      </dialog>
    </header>
  );
}
