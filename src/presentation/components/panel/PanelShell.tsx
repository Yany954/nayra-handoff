"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "@/presentation/ui/icons";

type NavItem = { href: string; label: string; icon: ReactNode };

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  "aria-hidden": true,
} as const;

const NAV: NavItem[] = [
  {
    href: "/panel",
    label: "Inicio",
    icon: (
      <svg {...iconProps} strokeLinejoin="round">
        <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    href: "/panel/promotores",
    label: "Promotores",
    icon: (
      <svg {...iconProps}>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    href: "/panel/logros",
    label: "Logros",
    icon: (
      <svg {...iconProps} strokeLinecap="round">
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
        <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
      </svg>
    ),
  },
  {
    href: "/panel/repertorio",
    label: "Repertorio",
    icon: (
      <svg {...iconProps}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    href: "/panel/shows",
    label: "Shows y fechas",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/panel/formatos",
    label: "Formatos",
    icon: (
      <svg {...iconProps} strokeLinecap="round">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    href: "/panel/galeria",
    label: "Galería",
    icon: (
      <svg {...iconProps} strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 17l-5-5-9 8" />
      </svg>
    ),
  },
  {
    href: "/panel/pitch",
    label: "Pitch",
    icon: (
      <svg {...iconProps} strokeLinejoin="round" strokeLinecap="round">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
      </svg>
    ),
  },
  {
    href: "/panel/epk",
    label: "EPK",
    icon: (
      <svg {...iconProps} strokeLinejoin="round">
        <path d="M4 4h16v16H4z" />
        <path d="M4 8l8 5 8-5" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  return href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="flex size-8 items-center justify-center rounded-full bg-accent font-display font-bold text-ink">N</span>
      <div className="flex flex-col">
        <span className="font-display text-base font-bold">Nayra Lancheros</span>
        <span className="text-xs text-muted-on-dark">Panel de la manager</span>
      </div>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Panel" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm no-underline ${
              active ? "bg-white/10 font-medium text-text-light" : "text-text-subtle hover:bg-white/5 hover:text-text-light"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer({ bookingEmail, signOut }: { bookingEmail: ReactNode; signOut: () => Promise<void> }) {
  return (
    <div className="mt-auto flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 rounded-[14px] bg-white/[0.06] p-3.5">
        <span className="text-xs text-muted-on-dark">Correo de booking</span>
        <span className="break-all text-[13px] font-medium">{bookingEmail}</span>
      </div>
      <div className="flex gap-2">
        <Link
          href="/"
          className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/14 text-sm text-text-subtle no-underline hover:text-text-light"
        >
          Ver sitio
        </Link>
        <form action={signOut} className="flex flex-1">
          <button
            type="submit"
            className="min-h-11 flex-1 cursor-pointer rounded-xl border border-white/14 bg-transparent text-sm text-text-subtle hover:text-text-light"
          >
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}

export function PanelShell({
  children,
  bookingEmail,
  signOut,
}: {
  children: ReactNode;
  bookingEmail: ReactNode;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDialogElement>(null);
  const closeMenu = () => menuRef.current?.close();

  return (
    <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
      <aside data-theme="dark" className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col gap-7 bg-ink px-4 py-6 text-text-light lg:flex">
        <Brand />
        <NavLinks pathname={pathname} />
        <Footer bookingEmail={bookingEmail} signOut={signOut} />
      </aside>

      <header data-theme="dark" className="sticky top-0 z-20 flex items-center justify-between bg-ink px-3 py-2.5 pt-[max(10px,env(safe-area-inset-top))] text-text-light lg:hidden">
        <Brand />
        <button
          type="button"
          aria-label="Abrir menú del panel"
          aria-haspopup="dialog"
          onClick={() => menuRef.current?.showModal()}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-text-light"
        >
          <MenuIcon />
        </button>
      </header>

      <dialog
        ref={menuRef}
        data-theme="dark"
        aria-label="Menú del panel"
        className="m-0 h-dvh max-h-none w-full max-w-none overscroll-contain border-0 bg-ink p-0 text-text-light backdrop:bg-ink open:flex open:flex-col lg:hidden"
      >
        <div className="flex flex-1 flex-col gap-7 px-4 py-4">
          <div className="flex items-center justify-between">
            <Brand />
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/12 text-text-light"
            >
              <CloseIcon />
            </button>
          </div>
          <NavLinks pathname={pathname} onNavigate={closeMenu} />
          <Footer bookingEmail={bookingEmail} signOut={signOut} />
        </div>
      </dialog>

      <main id="contenido" tabIndex={-1} className="box-border flex min-w-0 flex-1 flex-col gap-7 px-5 pb-16 pt-7 lg:px-10 lg:pb-16 lg:pt-9">
        {children}
      </main>
    </div>
  );
}

export function PanelHeading({ eyebrow, title, actions }: { eyebrow?: ReactNode; title: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        {eyebrow && <span className="text-[13px] text-muted-on-light">{eyebrow}</span>}
        <h1 className="m-0 text-balance font-display text-[36px] font-bold leading-none tracking-[-0.03em] lg:text-[48px]">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
