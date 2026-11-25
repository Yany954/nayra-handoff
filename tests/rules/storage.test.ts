import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { createEnv } from "./setup";

let env: RulesTestEnvironment;
const anon = () => env.unauthenticatedContext().storage();
const stranger = () => env.authenticatedContext("stranger", { email: "someone@gmail.com" }).storage();
const admin = () => env.authenticatedContext("manager", { admin: true }).storage();

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const image = { contentType: "image/jpeg" };
/** UploadTask is thenable but not a Promise; the assert helpers want a real one. */
const upload = (task: { then: PromiseLike<unknown>["then"] }) => Promise.resolve(task);

beforeAll(async () => {
  env = await createEnv();
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.storage().ref("public/gallery/existing.jpg").put(jpeg, image);
  });
});

describe("storage", () => {
  it("anyone can read public photos", async () => {
    await assertSucceeds(anon().ref("public/gallery/existing.jpg").getMetadata());
  });

  it("only the admin can upload, and only images under 10 MB", async () => {
    await assertFails(upload(anon().ref("public/gallery/new.jpg").put(jpeg, image)));
    await assertFails(upload(stranger().ref("public/gallery/new.jpg").put(jpeg, image)));
    await assertSucceeds(upload(admin().ref("public/gallery/new.jpg").put(jpeg, image)));
    await assertFails(upload(admin().ref("public/gallery/notes.pdf").put(jpeg, { contentType: "application/pdf" })));
    await assertFails(upload(admin().ref("public/gallery/huge.jpg").put(new Uint8Array(10 * 1024 * 1024), image)));
  });

  it("only the admin can delete", async () => {
    await assertFails(stranger().ref("public/gallery/existing.jpg").delete());
    await assertSucceeds(admin().ref("public/gallery/existing.jpg").delete());
  });

  it("denies everything outside public/", async () => {
    await assertFails(anon().ref("private/x.jpg").getMetadata());
    await assertFails(upload(admin().ref("private/x.jpg").put(jpeg, image)));
  });
});
