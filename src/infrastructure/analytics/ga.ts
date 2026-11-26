import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { SiteStats } from "@/domain/entities";

export type StatsResult = { ok: true; stats: SiteStats } | { ok: false; reason: "not_configured" | "no_access" | "error" };

const HOUR = 60 * 60 * 1000;
/** Per-instance memo: the panel home asks GA at most once an hour (quota and speed). */
let memo: { at: number; result: StatsResult } | null = null;

const num = (v: string | null | undefined) => Number(v ?? 0) || 0;

/**
 * Reads GA4 with the server's own identity (App Hosting service account, or your gcloud login
 * locally): no keys. The service account needs the Viewer role on the GA property.
 */
export async function getSiteStats(now = Date.now()): Promise<StatsResult> {
  const propertyId = process.env.GA_PROPERTY_ID?.trim();
  if (!propertyId) return { ok: false, reason: "not_configured" };
  if (memo && now - memo.at < HOUR) return memo.result;

  const client = new BetaAnalyticsDataClient();
  const property = `properties/${propertyId}`;
  const current = { startDate: "7daysAgo", endDate: "today" };
  const previous = { startDate: "14daysAgo", endDate: "8daysAgo" };
  let result: StatsResult;
  try {
    const [[totals], [pages], [events]] = await Promise.all([
      client.runReport({ property, dateRanges: [current, previous], metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }] }),
      client.runReport({
        property,
        dateRanges: [current],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 5,
      }),
      client.runReport({
        property,
        dateRanges: [current],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["contact_whatsapp", "contact_cta", "generate_lead"] } } },
      }),
    ]);
    // With two date ranges GA adds a "dateRange" dimension: date_range_0 = current, date_range_1 = previous.
    const range = (index: number, metric: number) =>
      num(totals.rows?.find((r) => r.dimensionValues?.[0]?.value === `date_range_${index}`)?.metricValues?.[metric]?.value);
    const event = (name: string) => num(events.rows?.find((r) => r.dimensionValues?.[0]?.value === name)?.metricValues?.[0]?.value);
    result = {
      ok: true,
      stats: {
        visitors: range(0, 0),
        visitorsBefore: range(1, 0),
        views: range(0, 1),
        viewsBefore: range(1, 1),
        topPages: (pages.rows ?? []).map((r) => ({ path: r.dimensionValues?.[0]?.value ?? "", views: num(r.metricValues?.[0]?.value) })),
        whatsappClicks: event("contact_whatsapp"),
        contactClicks: event("contact_cta"),
        leads: event("generate_lead"),
      },
    };
  } catch (error) {
    const code = (error as { code?: number }).code;
    result = { ok: false, reason: code === 7 ? "no_access" : "error" };
  }
  memo = { at: now, result };
  return result;
}
