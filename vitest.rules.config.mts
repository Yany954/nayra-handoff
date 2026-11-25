import { defineConfig } from "vitest/config";

/** Security-rules tests: they need the Firestore and Storage emulators (see `npm run test:rules`). */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
