/** Cells that start like a formula are prefixed so Excel shows them as text (CSV injection). */
function cell(value: string | null | undefined): string {
  let text = value ?? "";
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[";\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Semicolon-separated with a BOM: what Excel in Spanish (Colombia) opens correctly. */
export function toCsv(header: readonly string[], rows: readonly (readonly (string | null | undefined)[])[]): string {
  return "﻿" + [header, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");
}
