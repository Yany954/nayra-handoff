import { describe, expect, it } from "vitest";
import { isAllowedAdmin, parseAllowlist } from "@/domain/rules/admins";

const list = parseAllowlist(" Mom@gmail.com,dev@gmail.com ,");

describe("server-side admin check", () => {
  it("needs the claim, a verified email and a listed address", () => {
    expect(isAllowedAdmin({ admin: true, email: "mom@gmail.com", email_verified: true }, list)).toBe(true);
    expect(isAllowedAdmin({ admin: false, email: "mom@gmail.com", email_verified: true }, list)).toBe(false);
    expect(isAllowedAdmin({ admin: true, email: "mom@gmail.com", email_verified: false }, list)).toBe(false);
    expect(isAllowedAdmin({ admin: true, email: "x@gmail.com", email_verified: true }, list)).toBe(false);
    expect(isAllowedAdmin({ admin: "true", email: "mom@gmail.com", email_verified: true }, list)).toBe(false);
  });

  it("an unset list denies everyone", () => {
    expect(isAllowedAdmin({ admin: true, email: "mom@gmail.com", email_verified: true }, parseAllowlist(undefined))).toBe(false);
  });
});
