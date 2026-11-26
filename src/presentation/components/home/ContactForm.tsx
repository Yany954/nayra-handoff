"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { BOOKING_EVENT_TYPES } from "@/domain/rules/booking";
import { EventDateInput } from "@/presentation/components/home/EventDateInput";
import { cardDark } from "@/presentation/ui/primitives";
import type { FormState } from "@/presentation/components/panel/form";

type SubmitAction = (prev: FormState, formData: FormData) => Promise<FormState>;

const labelClass = "flex flex-col gap-2 text-[13px] text-muted-on-dark";
const fieldClass =
  "rounded-xl border border-white/45 bg-field text-base text-text-light [color-scheme:dark] placeholder:text-muted-on-dark lg:text-[15px] aria-[invalid=true]:border-[#F4A38F]";
const inputClass = `${fieldClass} min-h-12 px-3.5`;
const errorClass = "text-[13px] font-medium text-[#F4A38F]";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <span id={`${id}-error`} className={errorClass}>
      {message}
    </span>
  ) : null;
}

/** aria wiring for a field that may have an error. */
function a11y(id: string, errors: Record<string, string>) {
  return {
    id,
    name: id,
    "aria-invalid": errors[id] ? true : undefined,
    "aria-describedby": errors[id] ? `${id}-error` : undefined,
  } as const;
}

export function ContactForm({ submit, whatsappHref }: { submit: SubmitAction; whatsappHref: string | null }) {
  const [state, dispatch, pending] = useActionState(submit, { status: "idle" } as FormState);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const mountedAt = useRef(0);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status === "ok") doneRef.current?.focus();
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Time on the page: people need seconds, bots post at once (checked on the server).
    formData.set("elapsedMs", String(Date.now() - mountedAt.current));
    startTransition(() => dispatch(formData));
  }

  if (state.status === "ok") {
    return (
      <div role="status" className={`flex min-w-0 flex-[1_1_100%] flex-col items-start gap-4 rounded-image p-6 sm:p-8 lg:flex-[1_1_520px] ${cardDark}`}>
        <h3 ref={doneRef} tabIndex={-1} className="m-0 font-display text-[28px] font-bold leading-tight outline-none">
          Solicitud enviada
        </h3>
        <p className="m-0 text-[17px] leading-[1.6] text-text-soft">{state.message}</p>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-track="contact_whatsapp" className="hit-44 text-text-light underline">
            ¿Es urgente? Escríbenos por WhatsApp<span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="contact-form-title"
      className={`grid min-w-0 flex-[1_1_100%] grid-cols-1 gap-4 rounded-image p-5 sm:grid-cols-2 sm:p-8 lg:flex-[1_1_520px] ${cardDark}`}
    >
      <h3 id="contact-form-title" className="sr-only">
        Formulario de contratación
      </h3>
      {/* Honeypot: invisible to people and screen readers; bots fill every field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          No llenar este campo
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className={labelClass}>
        Nombre
        <input {...a11y("name", errors)} type="text" autoComplete="name" placeholder="Tu nombre…" className={inputClass} />
        <FieldError id="name" message={errors.name} />
      </label>
      <label className={labelClass}>
        Tipo de evento
        <select {...a11y("eventType", errors)} defaultValue={BOOKING_EVENT_TYPES[0].value} className={`${fieldClass} min-h-12 px-3`}>
          {BOOKING_EVENT_TYPES.map((t) => (
            <option key={t.value}>{t.value}</option>
          ))}
        </select>
        <FieldError id="eventType" message={errors.eventType} />
      </label>
      <label className={labelClass}>
        Teléfono / WhatsApp
        <input {...a11y("phone", errors)} type="tel" inputMode="tel" autoComplete="tel" placeholder="300 123 4567…" className={inputClass} />
        <FieldError id="phone" message={errors.phone} />
      </label>
      <label className={labelClass}>
        Correo (opcional si dejas teléfono)
        <input {...a11y("email", errors)} type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder="nombre@correo.com…" className={inputClass} />
        <FieldError id="email" message={errors.email} />
      </label>
      <label className={labelClass}>
        Fecha
        <EventDateInput className={`${inputClass} min-w-0`} invalid={Boolean(errors.eventDate)} />
        <FieldError id="eventDate" message={errors.eventDate} />
      </label>
      <label className={labelClass}>
        Municipio
        <input {...a11y("municipality", errors)} type="text" autoComplete="address-level2" placeholder="Ej. Valledupar…" className={inputClass} />
        <FieldError id="municipality" message={errors.municipality} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Mensaje
        <textarea {...a11y("message", errors)} rows={4} placeholder="Cuéntanos del evento: lugar, número de invitados, horario…" className={`${fieldClass} resize-y px-3.5 py-3`} />
        <FieldError id="message" message={errors.message} />
      </label>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[13px] leading-normal text-muted-on-dark">
          <input {...a11y("consent", errors)} type="checkbox" className="mt-0.5 size-5 shrink-0 accent-accent" />
          <span>
            Autorizo el tratamiento de mis datos para responder esta solicitud, según la{" "}
            <Link href="/privacidad" className="text-text-light underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        <FieldError id="consent" message={errors.consent} />
      </div>
      {state.status === "error" && (
        <p role="alert" className={`m-0 sm:col-span-2 ${errorClass}`}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        data-track="contact_submit"
        className="min-h-[52px] cursor-pointer rounded-full border-0 bg-accent text-base font-semibold text-ink hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
      >
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
