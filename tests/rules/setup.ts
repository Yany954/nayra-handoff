import { readFileSync } from "node:fs";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";

/** Separate project id so the tests never touch the data `npm run seed` loaded into demo-nayra. */
export const PROJECT_ID = "demo-nayra-rules";

function hostPort(variable: string, fallback: string) {
  const [host, port] = (process.env[variable] ?? fallback).split(":");
  return { host, port: Number(port) };
}

export function createEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      ...hostPort("FIRESTORE_EMULATOR_HOST", "127.0.0.1:8080"),
    },
    storage: {
      rules: readFileSync("storage.rules", "utf8"),
      ...hostPort("FIREBASE_STORAGE_EMULATOR_HOST", "127.0.0.1:9199"),
    },
  });
}
