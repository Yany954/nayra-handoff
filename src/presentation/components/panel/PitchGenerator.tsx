"use client";

import { useState, useTransition } from "react";
import { RECIPIENT_KINDS, type Format, type PitchTemplates, type Profile, type Promoter, type RecipientKind } from "@/domain/entities";
import {
  RECIPIENT_LABELS,
  buildPitch,
  gmailComposeUrl,
  mailtoUrl,
  recipientFromPromoter,
  recipientKindFor,
  type PitchRecipient,
} from "@/domain/rules/pitch";
import { STAGE_LABELS } from "@/domain/rules/promoters";
import { Field, fieldClass, inputClass, primaryButton, type FormState } from "@/presentation/components/panel/form";

const OTHER = "otro";

export type AdaptResponse = { status: "ok"; text: string; fake: boolean } | { status: "error"; message: string };

export type AdaptRequest = {
  kindLabel: string;
  paragraph: string;
  recipientName: string;
  event: string;
  city: string;
  date: string;
  notes: string;
  formats: string;
};
const emptyRecipient: PitchRecipient = { name: "", email: "", event: "", city: "", date: null };

const lightButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-transparent px-[18px] text-sm font-medium text-text-dark no-underline hover:border-text-dark disabled:cursor-not-allowed disabled:opacity-50";

export function PitchGenerator({
  templates,
  profile,
  formats,
  promoters,
  initialPromoterId,
  markSent,
  adapt,
}: {
  templates: PitchTemplates;
  profile: Profile;
  formats: Format[];
  promoters: Promoter[];
  initialPromoterId: string | null;
  markSent: (promoterId: string) => Promise<FormState>;
  adapt: (input: AdaptRequest) => Promise<AdaptResponse>;
}) {
  const initial = promoters.find((p) => p.id === initialPromoterId) ?? null;
  const [promoterId, setPromoterId] = useState<string>(initial?.id ?? OTHER);
  const [kind, setKind] = useState<RecipientKind>(recipientKindFor(initial?.type));
  const [recipient, setRecipient] = useState<PitchRecipient>(initial ? recipientFromPromoter(initial) : emptyRecipient);
  const [draft, setDraft] = useState(() => buildPitch(templates, kind, { profile, formats, recipient }));
  const [notice, setNotice] = useState("");
  const [sending, startSending] = useTransition();
  const [adapting, startAdapting] = useTransition();
  const [suggestion, setSuggestion] = useState<AdaptResponse | null>(null);
  const selected = promoters.find((p) => p.id === promoterId) ?? null;

  // The draft is regenerated only on these explicit changes, so manual edits survive everything else.
  function regenerate(nextKind: RecipientKind, nextRecipient: PitchRecipient) {
    setKind(nextKind);
    setRecipient(nextRecipient);
    setDraft(buildPitch(templates, nextKind, { profile, formats, recipient: nextRecipient }));
    setNotice("");
    setSuggestion(null);
  }

  function askAi() {
    startAdapting(async () => {
      setSuggestion(
        await adapt({
          kindLabel: RECIPIENT_LABELS[kind],
          paragraph: templates.kinds[kind].paragraph,
          recipientName: recipient.name,
          event: recipient.event,
          city: recipient.city,
          date: recipient.date ?? "",
          notes: selected?.notes ?? "",
          formats: formats.map((f) => `${f.name} (${f.membersLabel})`).join(", "),
        }),
      );
    });
  }

  /** Rebuilds the email with the suggested paragraph in place of the template's. */
  function applySuggestion(text: string) {
    const custom = { ...templates, kinds: { ...templates.kinds, [kind]: { ...templates.kinds[kind], paragraph: text } } };
    setDraft(buildPitch(custom, kind, { profile, formats, recipient }));
    setSuggestion(null);
    setNotice("Párrafo de la IA aplicado. Revísalo antes de enviar.");
  }

  function pickPromoter(id: string) {
    setPromoterId(id);
    const promoter = promoters.find((p) => p.id === id);
    if (promoter) regenerate(recipientKindFor(promoter.type), recipientFromPromoter(promoter));
    else regenerate(kind, emptyRecipient);
  }

  function editRecipient(change: Partial<PitchRecipient>) {
    regenerate(kind, { ...recipient, ...change });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      setNotice("Asunto y texto copiados.");
    } catch {
      setNotice("No se pudo copiar. Selecciona el texto y cópialo a mano.");
    }
  }

  const missing = [...new Set((draft.subject + draft.body).match(/\{[a-z_]+\}/g) ?? [])];

  return (
    <div className="flex flex-col gap-6 rounded-card bg-ink p-5 text-text-light sm:p-8" data-theme="dark">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="m-0 font-display text-[36px] font-bold leading-none tracking-[-0.03em] sm:text-[48px]">Generador de pitch</h2>
        <p className="m-0 max-w-[440px] text-[15px] leading-[1.55] text-muted-on-dark">
          Elige a quién le escribes. El correo se arma con los datos del EPK y de la base de promotores.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pitch-promoter" className="text-sm font-medium text-text-subtle">
            ¿A quién le escribes?
          </label>
          <select
            id="pitch-promoter"
            value={promoterId}
            onChange={(event) => pickPromoter(event.target.value)}
            className={`${inputClass} pr-3`}
          >
            <option value={OTHER}>Otro (escribir los datos)</option>
            {promoters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {STAGE_LABELS[p.stage]}
              </option>
            ))}
          </select>
        </div>
        <div role="group" aria-label="Tipo de destinatario" className="flex flex-wrap items-end gap-2">
          {RECIPIENT_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === kind}
              onClick={() => regenerate(k, recipient)}
              className={`min-h-11 cursor-pointer rounded-full px-[18px] text-sm ${
                k === kind
                  ? "border-0 bg-text-light font-semibold text-ink"
                  : "border border-white/20 bg-transparent font-medium text-text-light hover:border-white/50"
              }`}
            >
              {RECIPIENT_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {promoterId === OTHER && (
        <fieldset className="m-0 grid gap-4 border-0 p-0 sm:grid-cols-2 [&_label]:text-text-subtle">
          <legend className="mb-3 text-sm font-medium text-text-subtle">Datos del destinatario</legend>
          <Field label="Nombre de la persona o entidad" name="pitch-name">
            <input id="pitch-name" value={recipient.name} onChange={(e) => editRecipient({ name: e.target.value })} className={inputClass} autoComplete="off" />
          </Field>
          <Field label="Evento o lugar" name="pitch-event">
            <input id="pitch-event" value={recipient.event} onChange={(e) => editRecipient({ event: e.target.value })} className={inputClass} autoComplete="off" />
          </Field>
          <Field label="Ciudad" name="pitch-city">
            <input id="pitch-city" value={recipient.city} onChange={(e) => editRecipient({ city: e.target.value })} className={inputClass} autoComplete="off" />
          </Field>
          <Field label="Fecha del evento (opcional)" name="pitch-date">
            <input id="pitch-date" type="date" value={recipient.date ?? ""} onChange={(e) => editRecipient({ date: e.target.value || null })} className={inputClass} />
          </Field>
        </fieldset>
      )}

      {/* The email, as in the EPK.dc.html mockup: a cream card with From / To / Subject / Body. */}
      <div className="overflow-hidden rounded-card bg-cream text-text-dark" data-theme="light">
        <div className="flex flex-col gap-3 border-b border-line-light px-5 py-4 text-sm sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="w-16 text-muted-on-light">De</span>
            <span className="[overflow-wrap:anywhere]">{profile.bookingEmail ?? "Configura el correo de booking"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <label htmlFor="pitch-to" className="w-16 text-muted-on-light">
              Para
            </label>
            <input
              id="pitch-to"
              type="email"
              inputMode="email"
              spellCheck={false}
              value={recipient.email}
              onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
              placeholder="correo@ejemplo.com…"
              className={`${inputClass} min-h-11 min-w-0 flex-1`}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <label htmlFor="pitch-subject" className="w-16 text-muted-on-light">
              Asunto
            </label>
            <input
              id="pitch-subject"
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              className={`${inputClass} min-h-11 min-w-0 flex-1 font-semibold`}
              autoComplete="off"
            />
          </div>
        </div>
        <label htmlFor="pitch-body" className="sr-only">
          Cuerpo del correo
        </label>
        <textarea
          id="pitch-body"
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          rows={18}
          className={`${fieldClass} block resize-y rounded-none border-0 bg-transparent px-5 py-5 text-[15px] leading-[1.7] sm:px-6`}
        />
        <div className="flex flex-col gap-3 border-t border-line-light px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={askAi} disabled={adapting} className={lightButton}>
              {adapting ? "Pensando…" : "Adaptar párrafo con IA"}
            </button>
            <span className="text-[13px] text-muted-on-light">Reescribe solo el párrafo del evento para este destinatario.</span>
          </div>
          {suggestion?.status === "error" && (
            <p role="alert" className="m-0 text-sm font-medium text-[#8F2D1F]">
              {suggestion.message}
            </p>
          )}
          {suggestion?.status === "ok" && (
            <div role="status" className="flex flex-col gap-3 rounded-card-sm border border-line-strong bg-white p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-on-light">
                Sugerencia{suggestion.fake ? " (de prueba: falta la llave de OpenAI)" : ""}
              </span>
              <p className="m-0 text-[15px] leading-[1.6]">{suggestion.text}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => applySuggestion(suggestion.text)} className={primaryButton}>
                  Usar este párrafo
                </button>
                <button type="button" onClick={() => setSuggestion(null)} className={lightButton}>
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
        {missing.length > 0 && (
          <p className="m-0 border-t border-line-light bg-[#FBEFD8] px-5 py-3 text-sm text-[#7A5108] sm:px-6">
            Faltan datos: {missing.join(", ")}. Complétalos en el texto o en el perfil antes de enviar.
          </p>
        )}
        <div className="flex flex-col gap-3 border-t border-line-light px-5 py-4 sm:px-6">
          <span className="text-[13px] text-muted-on-light">
            Adjunta el EPK en PDF. Gmail no permite adjuntarlo automáticamente desde un enlace.
          </span>
          <div className="flex flex-wrap gap-2">
            <a href="/panel/epk/pdf" download className={lightButton}>
              Descargar EPK (PDF)
            </a>
            <button type="button" onClick={copy} className={lightButton}>
              Copiar texto
            </button>
            <a href={mailtoUrl(draft, recipient.email)} className={lightButton}>
              Abrir en app de correo
            </a>
            <a href={gmailComposeUrl(draft, recipient.email, profile.bookingEmail)} target="_blank" rel="noopener noreferrer" className={primaryButton}>
              Abrir en Gmail<span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!selected || sending}
          onClick={() => selected && startSending(async () => setNotice((await markSent(selected.id)).message ?? ""))}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] text-sm font-semibold text-ink hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Guardando…" : "Ya lo envié: marcar «Contactado»"}
        </button>
        <p role="status" className="m-0 text-sm text-text-subtle">
          {notice || (selected ? "Programa el seguimiento a 7 días." : "Elige un promotor de la base para poder marcarlo.")}
        </p>
      </div>
    </div>
  );
}
