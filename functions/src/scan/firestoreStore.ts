import type { Firestore } from "firebase-admin/firestore";
import { EMPTY_STATE, type ScanState, type ScanStore } from "./runScan";
import type { DiscoveredEventDoc } from "./schema";

/** discoveredEvents use the hash as document id, so a duplicate can never be written twice. */
export function firestoreScanStore(db: Firestore): ScanStore {
  const stateRef = db.doc("scans/state");
  return {
    getState: async () => {
      const snapshot = await stateRef.get();
      return snapshot.exists ? { ...EMPTY_STATE, ...(snapshot.data() as Partial<ScanState>) } : EMPTY_STATE;
    },
    saveState: async (state) => {
      await stateRef.set(state);
    },
    existingHashes: async (hashes) => {
      if (hashes.length === 0) return new Set();
      const snapshots = await db.getAll(...hashes.map((h) => db.collection("discoveredEvents").doc(h)));
      return new Set(snapshots.filter((s) => s.exists).map((s) => s.id));
    },
    saveEvents: async (events: DiscoveredEventDoc[]) => {
      const batch = db.batch();
      for (const event of events) batch.create(db.collection("discoveredEvents").doc(event.hash), event);
      if (events.length > 0) await batch.commit();
    },
  };
}
