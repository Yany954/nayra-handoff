"use client";

/** Local calendar day of the visitor, as YYYY-MM-DD. */
function todayKey(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Past dates make no sense for a booking. The minimum is set in the browser,
 * because the page is cached and a server-rendered `min` could be a day old.
 */
export function EventDateInput({ className, invalid = false }: { className: string; invalid?: boolean }) {
  return (
    <input
      type="date"
      id="eventDate"
      name="eventDate"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? "eventDate-error" : undefined}
      className={className}
      ref={(input) => {
        if (input) input.min = todayKey();
      }}
      onChange={(event) => {
        const input = event.currentTarget;
        input.setCustomValidity(
          input.value && input.value < input.min ? "Elige una fecha de hoy en adelante." : "",
        );
      }}
    />
  );
}
