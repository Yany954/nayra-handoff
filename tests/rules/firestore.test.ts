import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { createEnv } from "./setup";

const PUBLIC = ["profile", "achievements", "shows", "formats", "videos", "gallery"];
const PRIVATE = ["epk", "pitch", "promoters", "discoveredEvents", "songs"];

let env: RulesTestEnvironment;
const anon = () => env.unauthenticatedContext().firestore();
// A signed-in Google account without the admin claim, e.g. a stranger who reached /panel.
const stranger = () => env.authenticatedContext("stranger", { email: "someone@gmail.com" }).firestore();
const admin = () => env.authenticatedContext("manager", { admin: true }).firestore();

const validBooking = () => ({
  name: "Alcaldía de Pailitas",
  eventType: "Festival / feria",
  eventDate: "2027-02-14",
  municipality: "Pailitas",
  message: "Queremos a Nayra para el festival.",
  phone: "3001234567",
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
});

beforeAll(async () => {
  env = await createEnv();
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const name of [...PUBLIC, ...PRIVATE]) await db.doc(`${name}/main`).set({ seeded: true });
    await db.doc("songs/main/private/meta").set({ key: "Am" });
    await db.doc("bookingRequests/existing").set({ name: "x" });
  });
});

describe("public content", () => {
  it.each(PUBLIC)("anyone can read %s", async (name) => {
    await assertSucceeds(anon().doc(`${name}/main`).get());
  });

  it.each(PUBLIC)("only the admin can write %s", async (name) => {
    await assertFails(anon().doc(`${name}/new`).set({ title: "x" }));
    await assertFails(stranger().doc(`${name}/new`).set({ title: "x" }));
    await assertFails(stranger().doc(`${name}/main`).delete());
    await assertSucceeds(admin().doc(`${name}/new`).set({ title: "x" }));
  });
});

describe("private content", () => {
  it.each(PRIVATE)("only the admin can read or write %s", async (name) => {
    await assertFails(anon().doc(`${name}/main`).get());
    await assertFails(stranger().doc(`${name}/main`).get());
    await assertFails(stranger().doc(`${name}/main`).set({ x: 1 }));
    await assertSucceeds(admin().doc(`${name}/main`).get());
    await assertSucceeds(admin().doc(`${name}/main`).set({ x: 1 }));
  });

  it("keeps song keys away from the public", async () => {
    await assertFails(anon().doc("songs/main/private/meta").get());
    await assertFails(stranger().doc("songs/main/private/meta").get());
    await assertSucceeds(admin().doc("songs/main/private/meta").get());
  });

  it("denies collections the rules do not mention", async () => {
    await assertFails(anon().doc("unknown/doc").get());
    await assertFails(stranger().doc("unknown/doc").set({ x: 1 }));
  });
});

describe("event scan", () => {
  it("only the admin can request a scan or read its status; nobody edits them from a client", async () => {
    await assertFails(anon().collection("scanRequests").add({ at: 1 }));
    await assertFails(stranger().collection("scanRequests").add({ at: 1 }));
    await assertSucceeds(admin().doc("scanRequests/x").set({ at: 1 }));
    // Status updates come only from the function (Admin SDK), never from a browser.
    await assertFails(admin().doc("scanRequests/x").update({ status: "done" }));
    await assertFails(admin().doc("scanRequests/x").delete());
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().doc("scans/state").set({ added: 3 });
    });
    await assertFails(anon().doc("scans/state").get());
    await assertFails(stranger().doc("scans/state").get());
    await assertSucceeds(admin().doc("scans/state").get());
    await assertFails(admin().doc("scans/state").set({ added: 99 }));
    await assertFails(admin().doc("aiUsage/2026-11-25T15").set({ calls: 0 }));
    await assertFails(stranger().doc("aiUsage/2026-11-25T15").get());
  });
});

describe("bookingRequests", () => {
  it("accepts a valid request from anyone", async () => {
    await assertSucceeds(anon().collection("bookingRequests").add(validBooking()));
  });

  it("rejects extra fields, oversized text and a forged createdAt", async () => {
    const requests = anon().collection("bookingRequests");
    await assertFails(requests.add({ ...validBooking(), stage: "cerrado" }));
    await assertFails(requests.add({ ...validBooking(), message: "x".repeat(2001) }));
    await assertFails(requests.add({ ...validBooking(), name: "" }));
    await assertFails(
      requests.add({ ...validBooking(), createdAt: firebase.firestore.Timestamp.fromDate(new Date(2020, 0, 1)) }),
    );
    const missingField: Partial<ReturnType<typeof validBooking>> = validBooking();
    delete missingField.municipality;
    await assertFails(requests.add(missingField));
  });

  it("only the admin can read, update or delete requests", async () => {
    await assertFails(anon().doc("bookingRequests/existing").get());
    await assertFails(stranger().doc("bookingRequests/existing").get());
    await assertFails(anon().doc("bookingRequests/existing").update({ name: "y" }));
    await assertFails(anon().doc("bookingRequests/existing").delete());
    await assertSucceeds(admin().doc("bookingRequests/existing").get());
    await assertSucceeds(admin().doc("bookingRequests/existing").delete());
  });
});
