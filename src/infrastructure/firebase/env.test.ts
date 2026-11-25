import { describe, expect, it } from "vitest";
import { resolveFirebaseTarget } from "@/infrastructure/firebase/env";

describe("resolveFirebaseTarget", () => {
  it("uses the emulator demo project locally", () => {
    expect(resolveFirebaseTarget({ GCLOUD_PROJECT: "demo-nayra" })).toEqual({ projectId: "demo-nayra", storageBucket: "demo-nayra.appspot.com" });
  });

  it("reads App Hosting's FIREBASE_CONFIG in production", () => {
    const env = { FIREBASE_CONFIG: JSON.stringify({ projectId: "nayra-lancheros", storageBucket: "nayra-lancheros.firebasestorage.app" }) };
    expect(resolveFirebaseTarget(env)).toEqual({ projectId: "nayra-lancheros", storageBucket: "nayra-lancheros.firebasestorage.app" });
  });

  it("never falls back to the demo project when Google Cloud says otherwise", () => {
    expect(resolveFirebaseTarget({ GOOGLE_CLOUD_PROJECT: "nayra-lancheros" })).toEqual({
      projectId: "nayra-lancheros",
      storageBucket: "nayra-lancheros.firebasestorage.app",
    });
  });

  it("lets explicit variables win and survives a malformed FIREBASE_CONFIG", () => {
    expect(resolveFirebaseTarget({ FIREBASE_CONFIG: "{oops", GCLOUD_PROJECT: "nayra-lancheros", FIREBASE_STORAGE_BUCKET: "custom" })).toEqual({
      projectId: "nayra-lancheros",
      storageBucket: "custom",
    });
  });
});
