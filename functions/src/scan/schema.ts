import { z } from "zod";

export const EVENT_TYPES = [
  "festival", "concurso", "feria", "fiestas_patronales", "alcaldia_casa_cultura", "corporativo", "hotel", "otro",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

const isoDate = z.iso.date();
const httpsUrl = z.url({ protocol: /^https$/ });

/**
 * One event as the LLM must return it. Everything comes from untrusted web pages, so it is
 * validated field by field and anything that does not fit is dropped, never "fixed".
 */
export const extractedEventSchema = z.object({
  name: z.string().trim().min(3).max(160),
  municipality: z.string().trim().max(80),
  department: z.string().trim().max(80),
  startDate: isoDate.nullable(),
  endDate: isoDate.nullable(),
  datesText: z.string().trim().max(80),
  type: z.enum(EVENT_TYPES),
  genres: z.array(z.string().trim().max(40)).max(8),
  contact: z.string().trim().max(160).nullable(),
  url: httpsUrl,
  sourceName: z.string().trim().max(120),
  openCall: z.boolean(),
  deadline: isoDate.nullable(),
  summary: z.string().trim().max(400),
});
export type ExtractedEvent = z.infer<typeof extractedEventSchema>;

/** What lands in Firestore `discoveredEvents` (SPEC §1). */
export type DiscoveredEventDoc = Omit<ExtractedEvent, "datesText" | "summary"> & {
  dates: string;
  note: string;
  relevance: number;
  status: "pending" | "approved" | "discarded";
  hash: string;
  foundAt: string;
};

/** Keeps only the items that validate; returns how many were dropped. */
export function parseExtracted(items: unknown): { events: ExtractedEvent[]; dropped: number } {
  const list = Array.isArray(items) ? items : [];
  const events: ExtractedEvent[] = [];
  for (const item of list) {
    const parsed = extractedEventSchema.safeParse(item);
    if (parsed.success) events.push(parsed.data);
  }
  return { events, dropped: list.length - events.length };
}
