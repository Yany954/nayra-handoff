import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Single Admin SDK instance for server code and scripts.
 * Locally the *_EMULATOR_HOST variables (see .env.example) point it at the emulators
 * and no credentials are needed; on App Hosting it uses the default service account.
 */
export function firebaseApp(): App {
  return (
    getApps()[0] ??
    initializeApp({
      projectId: process.env.GCLOUD_PROJECT ?? "demo-nayra",
      storageBucket: storageBucketName(),
    })
  );
}

export function db(): Firestore {
  return getFirestore(firebaseApp());
}

export function bucket() {
  return getStorage(firebaseApp()).bucket();
}

export function storageBucketName(): string {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ??
    `${process.env.GCLOUD_PROJECT ?? "demo-nayra"}.appspot.com`
  );
}

/** Public download URL for an object under `public/`, which storage.rules lets anyone read. */
export function publicStorageUrl(storagePath: string): string {
  const emulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  const origin = emulator ? `http://${emulator}` : "https://firebasestorage.googleapis.com";
  return `${origin}/v0/b/${storageBucketName()}/o/${encodeURIComponent(storagePath)}?alt=media`;
}
