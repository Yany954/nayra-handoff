/**
 * Where the Admin SDK points, resolved from the environment:
 * - App Hosting / Cloud Functions set FIREBASE_CONFIG (JSON with projectId and storageBucket)
 *   and GOOGLE_CLOUD_PROJECT; no keys are needed (default service account).
 * - Local development uses .env.local (GCLOUD_PROJECT=demo-nayra + emulator hosts).
 * - Explicit variables always win, so scripts can target a project on purpose.
 */
export type FirebaseTarget = { projectId: string; storageBucket: string };

export function resolveFirebaseTarget(env: Record<string, string | undefined>): FirebaseTarget {
  let config: { projectId?: string; storageBucket?: string } = {};
  try {
    config = env.FIREBASE_CONFIG ? JSON.parse(env.FIREBASE_CONFIG) : {};
  } catch {
    config = {};
  }
  const projectId = env.GCLOUD_PROJECT || config.projectId || env.GOOGLE_CLOUD_PROJECT || "demo-nayra";
  // demo-* projects only exist in the emulator, where the bucket name is free to choose.
  const defaultBucket = projectId.startsWith("demo-") ? `${projectId}.appspot.com` : `${projectId}.firebasestorage.app`;
  return { projectId, storageBucket: env.FIREBASE_STORAGE_BUCKET || config.storageBucket || defaultBucket };
}
