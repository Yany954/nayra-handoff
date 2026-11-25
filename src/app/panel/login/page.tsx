import type { Metadata } from "next";
import Link from "next/link";
import { GoogleSignIn } from "./GoogleSignIn";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="flex w-full max-w-[420px] flex-col gap-8 rounded-card border border-line-light bg-white p-8 sm:p-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent font-display font-bold text-ink">
            N
          </span>
          <div className="flex flex-col">
            <span className="font-display text-base font-bold">Nayra Lancheros</span>
            <span className="text-xs text-muted-on-light">Panel de la manager</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-balance font-display text-[36px] font-bold leading-none tracking-[-0.03em]">Entrar al panel</h1>
          <p className="m-0 text-[15px] leading-normal text-muted-on-light">
            Solo las cuentas de Google autorizadas pueden entrar.
          </p>
        </div>
        <GoogleSignIn />
        <Link href="/" className="hit-44 self-start text-sm text-muted-on-light">
          Volver al sitio
        </Link>
      </div>
    </main>
  );
}
