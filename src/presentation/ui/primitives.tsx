import type { ReactNode } from "react";

export const cardDark = "border border-white/10 bg-white/5";
export const displayHeading =
  "m-0 font-display font-bold leading-none tracking-[-0.03em]";

export function Pill({ children, className = "bg-white/[0.07] text-text-subtle" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-3 py-1.5 text-[13px] ${className}`}>
      {children}
    </span>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className={`${displayHeading} text-[40px] sm:text-[52px] lg:text-[64px]`}>
      {children}
    </h2>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto box-border w-full max-w-[1360px] px-5 pt-20 lg:px-12 lg:pt-[120px] ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, className = "text-muted-on-dark" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`text-[13px] font-semibold uppercase tracking-[0.1em] ${className}`}>
      {children}
    </span>
  );
}
