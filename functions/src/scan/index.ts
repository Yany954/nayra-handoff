import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FixtureExtractor, FixtureSearch, OpenAIExtractor, TavilySearch } from "./providers";
import { runScan, type ScanDeps, type ScanState } from "./runScan";
import { firestoreScanStore } from "./firestoreStore";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const TAVILY_API_KEY = defineSecret("TAVILY_API_KEY");
const OPENAI_MODEL = defineString("OPENAI_MODEL", { default: "gpt-5-mini", description: "Cheap model for event extraction" });

/** Keep it next to the Firestore location when the real project is created (SPEC §5). */
const REGION = "us-east1";
/** "Buscar ahora" at most once every 30 minutes, whatever the panel sends. */
const MANUAL_COOLDOWN_MS = 30 * 60 * 1000;

const db = () => getFirestore(getApps()[0] ?? initializeApp());

function secret(param: typeof OPENAI_API_KEY): string {
  try {
    return param.value().trim();
  } catch {
    return "";
  }
}

/** Real providers when both keys exist; fixtures only in the emulator; otherwise a clear error. */
function deps(): ScanDeps | string {
  const store = firestoreScanStore(db());
  const openai = secret(OPENAI_API_KEY);
  const tavily = secret(TAVILY_API_KEY);
  if (openai && tavily) {
    return { search: new TavilySearch(tavily), extractor: new OpenAIExtractor(openai, OPENAI_MODEL.value()), store };
  }
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return { search: new FixtureSearch(), extractor: new FixtureExtractor(), store };
  }
  return "Faltan las llaves OPENAI_API_KEY y/o TAVILY_API_KEY (firebase functions:secrets:set).";
}

async function scan(trigger: ScanState["lastTrigger"]) {
  const resolved = deps();
  if (typeof resolved === "string") {
    await db().doc("scans/state").set({ lastRunAt: new Date().toISOString(), lastTrigger: trigger, errors: [resolved] }, { merge: true });
    logger.error(resolved);
    return null;
  }
  const state = await runScan(resolved, new Date(), trigger);
  logger.info("scanEvents done", { ...state, errors: state.errors.length });
  return state;
}

const options = { region: REGION, secrets: [OPENAI_API_KEY, TAVILY_API_KEY], timeoutSeconds: 540, memory: "512MiB" as const };

export const scanEvents = onSchedule({ ...options, schedule: "every 72 hours", timeZone: "America/Bogota" }, async () => {
  await scan("schedule");
});

/** The panel's "Buscar ahora" creates scanRequests/{id} (admin-only by rules); this runs the scan. */
export const onScanRequested = onDocumentCreated({ ...options, document: "scanRequests/{id}" }, async (event) => {
  const ref = event.data?.ref;
  if (!ref) return;
  const last = (await db().doc("scans/state").get()).get("lastRunAt") as string | undefined;
  if (last && Date.now() - Date.parse(last) < MANUAL_COOLDOWN_MS) {
    await ref.update({ status: "skipped", reason: "cooldown" });
    return;
  }
  await ref.update({ status: "running" });
  const state = await scan("manual");
  await ref.update({ status: state ? "done" : "error", finishedAt: new Date().toISOString(), added: state?.added ?? 0 });
});
