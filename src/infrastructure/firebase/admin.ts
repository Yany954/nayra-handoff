import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { resolveFirebaseTarget } from "@/infrastructure/firebase/env";

const target = () => resolveFirebaseTarget(process.env);

/**
 * Single Admin SDK instance for server code and scripts.
 * Locally the *_EMULATOR_HOST variables (see .env.example) point it at the emulators
 * and no credentials are needed; on App Hosting it uses the default service account.
 */
export function firebaseApp(): App {
  return (
    getApps()[0] ??
    initializeApp(target())
  );
}

export function db(): Firestore {
  return getFirestore(firebaseApp());
}

export function bucket() {
  return getStorage(firebaseApp()).bucket();
}

export function storageBucketName(): string {
  return target().storageBucket;
}

/** Public download URL for an object under `public/`, which storage.rules lets anyone read. */
export function publicStorageUrl(storagePath: string): string {
  const emulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  const origin = emulator ? `http://${emulator}` : "https://firebasestorage.googleapis.com";
  return `${origin}/v0/b/${storageBucketName()}/o/${encodeURIComponent(storagePath)}?alt=media`;
}
