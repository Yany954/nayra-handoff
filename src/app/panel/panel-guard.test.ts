import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const ADMIN_DIR = join(process.cwd(), "src/app/panel/(admin)");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

/** Static guard: a new panel page or action that forgets the admin check fails CI. */
describe("panel access guard", () => {
  const all = files(ADMIN_DIR);

  it.each(all.filter((f) => f.endsWith("page.tsx")).map((f) => [f.replace(ADMIN_DIR, "")]))(
    "%s calls requireAdmin()",
    (relative) => {
      expect(readFileSync(join(ADMIN_DIR, relative), "utf8")).toMatch(/await requireAdmin\(\)/);
    },
  );

  // Pages read the session at request time; each segment needs its own Suspense boundary
  // so client navigations between panel pages stay instant (Next 16 Cache Components).
  it.each(all.filter((f) => f.endsWith("page.tsx")).map((f) => [f.replace(ADMIN_DIR, "")]))(
    "%s has a loading.tsx boundary",
    (relative) => {
      expect(existsSync(join(dirname(join(ADMIN_DIR, relative)), "loading.tsx"))).toBe(true);
    },
  );

  it.each(all.filter((f) => f.endsWith("actions.ts")).map((f) => [f.replace(ADMIN_DIR, "")]))(
    "every exported action in %s calls requireAdmin() first",
    (relative) => {
      const source = readFileSync(join(ADMIN_DIR, relative), "utf8");
      const actions = [...source.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{\s*([^\n]*)/g)];
      expect(actions.length).toBeGreaterThan(0);
      for (const [, name, firstLine] of actions) {
        // signOut is the one action that must work for anyone holding a cookie.
        if (name === "signOut") continue;
        expect(firstLine, name).toBe("await requireAdmin();");
      }
    },
  );
});
