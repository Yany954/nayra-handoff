"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import { CloseIcon } from "@/presentation/ui/icons";
import { submitKeepingValues } from "@/presentation/components/panel/submit";
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

export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "textarea" | "lines" | "select" | "checkbox" | "number" | "date" | "url";
  options?: readonly { value: string; label: string }[];
  hint?: string;
  placeholder?: string;
  /** Spans both columns on wide screens. */
  wide?: boolean;
};

export type RecordValues = Record<string, string | number | boolean | string[] | null | undefined>;
export type SaveAction = (prev: FormState, formData: FormData) => Promise<FormState>;
export type DeleteAction = (id: string) => Promise<FormState>;

function asText(value: RecordValues[string]): string {
  if (Array.isArray(value)) return value.join("\n");
  if (value === null || value === undefined || typeof value === "boolean") return "";
  return String(value);
}

function Input({ field, value, error }: { field: FieldDef; value: RecordValues[string]; error?: string }) {
  const aria = describedBy(field.name, error, field.hint);
  switch (field.kind) {
    case "textarea":
    case "lines":
      return <textarea {...aria} defaultValue={asText(value)} rows={field.kind === "lines" ? 6 : 3} placeholder={field.placeholder} className={`${fieldClass} resize-y py-3`} />;
    case "select":
      return (
        <select {...aria} defaultValue={asText(value)} className={`${inputClass} pr-3`}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "number":
      return <input {...aria} type="number" inputMode="numeric" defaultValue={asText(value)} className={inputClass} />;
    case "date":
      return <input {...aria} type="date" defaultValue={asText(value)} className={inputClass} />;
    case "url":
      return <input {...aria} type="url" inputMode="url" defaultValue={asText(value)} placeholder={field.placeholder} className={inputClass} autoComplete="off" />;
    default:
      return <input {...aria} type="text" defaultValue={asText(value)} placeholder={field.placeholder} className={inputClass} autoComplete="off" />;
  }
}

export function RecordForm({
  fields,
  values,
  id,
  save,
  submitLabel = "Guardar",
  onSaved,
  onCancel,
  warnOnUnsaved = false,
}: {
  fields: readonly FieldDef[];
  values: RecordValues;
  id: string | null;
  save: SaveAction;
  submitLabel?: string;
  onSaved?: (state: FormState) => void;
  onCancel?: () => void;
  /** Asks before leaving the page with unsaved edits (ISO 9241-110 error tolerance). */
  warnOnUnsaved?: boolean;
}) {
  const [dirty, setDirty] = useState(false);
  const [state, action, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await save(prev, formData);
    if (result.status === "ok") setDirty(false);
    return result;
  }, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (!warnOnUnsaved || !dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [warnOnUnsaved, dirty]);

  useEffect(() => {
    if (state.status === "ok") onSaved?.(state);
    // Keyboard and screen-reader users land on the first field to fix.
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state, onSaved]);

  return (
    <form
      ref={formRef}
      onSubmit={submitKeepingValues(action)}
      noValidate
      onInput={() => setDirty(true)}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {id && <input type="hidden" name="id" value={id} />}
      {fields.map((field) =>
        field.kind === "checkbox" ? (
          <label key={field.name} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-text-body sm:col-span-2">
            <input type="checkbox" name={field.name} defaultChecked={values[field.name] === true} className="size-5 accent-text-dark" />
            <span>
              {field.label}
              {field.hint && <span className="block text-[13px] font-normal text-muted-on-light">{field.hint}</span>}
            </span>
          </label>
        ) : (
          <div key={field.name} className={field.wide || field.kind === "textarea" || field.kind === "lines" ? "sm:col-span-2" : ""}>
            <Field label={field.label} name={field.name} hint={field.hint} error={errors[field.name]}>
              <Input field={field} value={values[field.name]} error={errors[field.name]} />
            </Field>
          </div>
        ),
      )}
      <div className="sm:col-span-2">
        <FormMessage state={state} />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:col-span-2">
        {warnOnUnsaved && dirty && !pending && <span className="mr-auto text-sm text-text-body">Tienes cambios sin guardar.</span>}
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Open/close state for a RecordDialog. */
export function useRecordDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<{ id: string | null; values: RecordValues; key: number } | null>(null);
  return {
    ref,
    current,
    reset: () => setCurrent(null),
    open: (id: string | null, values: RecordValues) => {
      setCurrent({ id, values, key: Date.now() });
      ref.current?.showModal();
    },
    close: () => ref.current?.close(),
  };
}

/** Modal (full screen on phones) that hosts a RecordForm. A stable component, so it never remounts. */
export function RecordDialog({
  dialogRef,
  onClosed,
  title,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onClosed: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="record-dialog-title"
      onClose={onClosed}
      className="m-0 box-border h-dvh max-h-none w-full max-w-none overscroll-contain border-0 bg-cream p-0 text-text-dark backdrop:bg-ink/60 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-[640px] sm:rounded-card"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 id="record-dialog-title" className="m-0 text-balance font-display text-2xl font-bold">
            {title}
          </h2>
          <button type="button" aria-label="Cerrar" onClick={() => dialogRef.current?.close()} className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-cream-deep text-text-dark hover:bg-line-light">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function ConfirmDelete({ label, onConfirm }: { label: string; onConfirm: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} aria-label={`Borrar ${label}`} className={secondaryButton}>
        Borrar
      </button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-body">¿Borrar?</span>
      <button type="button" disabled={pending} onClick={() => startTransition(onConfirm)} className={dangerButton}>
        {pending ? "Borrando…" : "Sí, borrar"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className={secondaryButton}>
        No
      </button>
    </span>
  );
}

export type ListItem = { id: string; title: string; subtitle?: string; badges?: string[]; values: RecordValues };

/** Generic list + add/edit dialog + delete, used by logros, repertorio and formatos. */
export function RecordList({
  items,
  fields,
  newValues,
  save,
  remove,
  noun,
  intro,
  empty,
}: {
  items: ListItem[];
  fields: readonly FieldDef[];
  newValues: RecordValues;
  save: SaveAction;
  remove: DeleteAction;
  noun: string;
  intro?: ReactNode;
  empty: string;
}) {
  const dialog = useRecordDialog();
  const [notice, setNotice] = useState("");
  const editing = dialog.current;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {intro && <p className="m-0 max-w-[640px] text-sm leading-normal text-muted-on-light">{intro}</p>}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <p role="status" className="m-0 text-sm text-[#1F5130]">
            {notice}
          </p>
          <button type="button" onClick={() => { setNotice(""); dialog.open(null, newValues); }} className={primaryButton}>
            + Agregar {noun}
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="m-0 rounded-[20px] border border-line-light bg-white p-6 text-muted-on-light">{empty}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card-sm border border-line-light bg-white px-5 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="break-words font-semibold">{item.title}</span>
                {item.subtitle && <span className="break-words text-sm text-muted-on-light">{item.subtitle}</span>}
                {item.badges && item.badges.length > 0 && (
                  <span className="flex flex-wrap gap-1.5 pt-0.5">
                    {item.badges.map((badge) => (
                      <span key={badge} className="rounded-full bg-cream-soft px-2.5 py-0.5 text-xs font-semibold text-text-body">
                        {badge}
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setNotice(""); dialog.open(item.id, item.values); }} aria-label={`Editar ${item.title}`} className={secondaryButton}>
                  Editar
                </button>
                <ConfirmDelete
                  label={item.title}
                  onConfirm={async () => {
                    const result = await remove(item.id);
                    setNotice(result.message ?? "");
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <RecordDialog dialogRef={dialog.ref} onClosed={dialog.reset} title={editing?.id ? `Editar ${noun}` : `Agregar ${noun}`}>
        {editing && (
          <RecordForm
            key={editing.key}
            fields={fields}
            values={editing.values}
            id={editing.id}
            save={save}
            onSaved={(state) => {
              setNotice(state.message ?? "");
              dialog.close();
            }}
            onCancel={dialog.close}
          />
        )}
      </RecordDialog>
    </>
  );
}
