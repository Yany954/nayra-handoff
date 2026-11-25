import type { ReactNode } from "react";

/** Result every panel Server Action returns to its form. */
export type FormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

/** 16px text so iOS does not zoom into fields. */
export const fieldClass =
  "box-border w-full rounded-xl border border-line-strong bg-white px-3.5 text-base text-text-dark placeholder:text-muted-heading focus-visible:border-text-dark";
export const inputClass = `${fieldClass} min-h-12`;

export const primaryButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 bg-text-dark px-[18px] text-sm font-semibold text-text-light no-underline disabled:cursor-wait disabled:opacity-60";
export const secondaryButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-white px-[18px] text-sm font-medium text-text-dark no-underline disabled:cursor-wait disabled:opacity-60";
export const dangerButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 bg-[#8F2D1F] px-[18px] text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60";

export function Field({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-text-body">
        {label}
      </label>
      {children}
      {hint && !error && (
        <span id={`${name}-hint`} className="text-[13px] text-muted-on-light">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${name}-error`} className="text-[13px] font-medium text-[#8F2D1F]">
          {error}
        </span>
      )}
    </div>
  );
}

/** aria wiring for an input inside <Field>. */
export function describedBy(name: string, error?: string, hint?: string) {
  return {
    id: name,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${name}-error` : hint ? `${name}-hint` : undefined,
  } as const;
}

export function FormMessage({ state }: { state: FormState }) {
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`m-0 min-h-[1.25em] text-sm ${state.status === "error" ? "font-medium text-[#8F2D1F]" : "text-[#1F5130]"}`}
    >
      {state.message}
    </p>
  );
}
