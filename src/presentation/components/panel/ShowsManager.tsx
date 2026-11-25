"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { ShowRow } from "@/application/panel";
import { CloseIcon } from "@/presentation/ui/icons";
import {
  Field,
  FormMessage,
  dangerButton,
  describedBy,
  fieldClass,
  initialFormState,
  inputClass,
  primaryButton,
  secondaryButton,
  type FormState,
} from "@/presentation/components/panel/form";
import { longDate } from "@/presentation/components/panel/stages";
import { submitKeepingValues } from "@/presentation/components/panel/submit";

type SaveAction = (prev: FormState, formData: FormData) => Promise<FormState>;
type DeleteAction = (id: string) => Promise<FormState>;

const ROLES: Record<ShowRow["publicRole"], { label: string; className: string }> = {
  ultimo: { label: "Último show en el sitio", className: "bg-[#FBEFD8] text-[#7A5108]" },
  proximo: { label: "Próxima fecha pública", className: "bg-[#E3F0E6] text-[#1F5130]" },
  oculto_por_confirmar: { label: "Por confirmar · no se muestra", className: "bg-cream-soft text-text-body" },
  pasado: { label: "Pasado", className: "bg-[#EFEAE3] text-[#5A504A]" },
};

function formatDate(date: string | null) {
  return date ? longDate(date) : "Sin fecha";
}

function ShowForm({ show, save, onDone }: { show: ShowRow | null; save: SaveAction; onDone: () => void }) {
  const [state, action, pending] = useActionState(save, initialFormState);
  const errors = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "ok") onDone();
    // Move focus to the first invalid field so keyboard and screen-reader users land on it.
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state, onDone]);

  return (
    <form ref={formRef} onSubmit={submitKeepingValues(action)} className="flex flex-col gap-4" noValidate>
      {show && <input type="hidden" name="id" value={show.id} />}
      <Field label="Lugar o evento" name="venue" error={errors.venue}>
        <input {...describedBy("venue", errors.venue)} defaultValue={show?.venue} className={inputClass} autoComplete="off" required />
      </Field>
      <Field label="Ciudad" name="city" error={errors.city}>
        <input {...describedBy("city", errors.city)} defaultValue={show?.city} placeholder="Ej. Curumaní, Cesar…" autoComplete="off" className={inputClass} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha" name="date" hint="Déjala vacía si no la recuerdas." error={errors.date}>
          <input {...describedBy("date", errors.date, "x")} type="date" defaultValue={show?.date ?? ""} className={inputClass} />
        </Field>
        <Field label="Estado" name="status" error={errors.status}>
          <select {...describedBy("status", errors.status)} defaultValue={show?.status ?? "confirmado"} className={`${inputClass} pr-3`}>
            <option value="confirmado">Confirmado</option>
            <option value="por_confirmar">Por confirmar (no se muestra)</option>
          </select>
        </Field>
      </div>
      <Field label="Descripción (opcional)" name="description" hint="Se ve en «Último show». Ej.: Se presentó como artista local del festival." error={errors.description}>
        <textarea {...describedBy("description", errors.description, "x")} defaultValue={show?.description} rows={3} className={`${fieldClass} resize-y py-3`} />
      </Field>
      <Field label="Video (opcional)" name="videoUrl" hint="Enlace de YouTube o Instagram." error={errors.videoUrl}>
        <input {...describedBy("videoUrl", errors.videoUrl, "x")} type="url" inputMode="url" defaultValue={show?.videoUrl} placeholder="https://…" className={inputClass} />
      </Field>
      <FormMessage state={state.status === "error" ? state : initialFormState} />
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onDone} className={secondaryButton}>
          Cancelar
        </button>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function DeleteButton({ show, remove, onDeleted }: { show: ShowRow; remove: DeleteAction; onDeleted: (msg: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={secondaryButton} aria-label={`Borrar ${show.venue}`}>
        Borrar
      </button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-body">¿Borrar este show?</span>
      <button
        type="button"
        disabled={pending}
        className={dangerButton}
        onClick={() =>
          startTransition(async () => {
            const result = await remove(show.id);
            onDeleted(result.message ?? "");
          })
        }
      >
        {pending ? "Borrando…" : "Sí, borrar"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
        No
      </button>
    </span>
  );
}

export function ShowsManager({ rows, save, remove }: { rows: ShowRow[]; save: SaveAction; remove: DeleteAction }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<{ show: ShowRow | null; key: number } | null>(null);
  const [notice, setNotice] = useState("");

  function open(show: ShowRow | null) {
    setEditing({ show, key: Date.now() });
    setNotice("");
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 max-w-[640px] text-sm leading-normal text-muted-on-light">
          El sitio muestra como «Último show» el más reciente que ya pasó (o el que no tiene fecha, si no hay otro). En «Próximas
          fechas» solo aparecen las confirmadas.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p role="status" className="m-0 text-sm text-[#1F5130]">
            {notice}
          </p>
          <button type="button" onClick={() => open(null)} className={primaryButton}>
            + Agregar show
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="m-0 rounded-[20px] border border-line-light bg-white p-6 text-muted-on-light">Todavía no hay shows.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {rows.map((show) => {
            const role = ROLES[show.publicRole];
            return (
              <li key={show.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-line-light bg-white p-5">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold ${role.className}`}>{role.label}</span>
                  <span className="font-display text-xl font-bold">{show.venue}</span>
                  <span className="text-sm text-text-body">
                    {show.city} · {formatDate(show.date)}
                  </span>
                  {show.description && <span className="text-sm text-muted-on-light">{show.description}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => open(show)} className={secondaryButton} aria-label={`Editar ${show.venue}`}>
                    Editar
                  </button>
                  <DeleteButton show={show} remove={remove} onDeleted={setNotice} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="show-dialog-title"
        onClose={() => setEditing(null)}
        className="m-0 box-border h-dvh max-h-none w-full max-w-none overscroll-contain border-0 bg-cream p-0 text-text-dark backdrop:bg-ink/60 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-[560px] sm:rounded-card"
      >
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 id="show-dialog-title" className="m-0 text-balance font-display text-2xl font-bold">
              {editing?.show ? "Editar show" : "Agregar show"}
            </h2>
            <button type="button" aria-label="Cerrar" onClick={close} className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-cream-deep text-text-dark">
              <CloseIcon />
            </button>
          </div>
          {editing && (
            <ShowForm
              key={editing.key}
              show={editing.show}
              save={save}
              onDone={() => {
                close();
              }}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
