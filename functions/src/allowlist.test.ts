import { describe, expect, it } from "vitest";
import { isAllowedAdmin, parseAllowlist } from "./allowlist";

const allowlist = parseAllowlist([" Manager@Gmail.com ", "dev@gmail.com", ""]);

describe("admin allowlist", () => {
  it("accepts listed, verified emails regardless of case and spaces", () => {
    expect(isAllowedAdmin({ email: "manager@gmail.com", emailVerified: true }, allowlist)).toBe(true);
    expect(isAllowedAdmin({ email: "DEV@gmail.com", emailVerified: true }, allowlist)).toBe(true);
  });

  it("rejects strangers, unverified emails and accounts without email", () => {
    expect(isAllowedAdmin({ email: "stranger@gmail.com", emailVerified: true }, allowlist)).toBe(false);
    expect(isAllowedAdmin({ email: "manager@gmail.com", emailVerified: false }, allowlist)).toBe(false);
    expect(isAllowedAdmin({ email: null, emailVerified: true }, allowlist)).toBe(false);
  });

  it("an empty list lets nobody in", () => {
    expect(isAllowedAdmin({ email: "dev@gmail.com", emailVerified: true }, parseAllowlist([]))).toBe(false);
  });
});
