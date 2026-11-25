/** Same rule as functions/src/allowlist.ts: the server re-checks what the blocking functions enforce. */
export function parseAllowlist(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedAdmin(
  claims: { email?: string; email_verified?: boolean; admin?: unknown },
  allowlist: Set<string>,
): boolean {
  return (
    claims.admin === true &&
    claims.email_verified === true &&
    typeof claims.email === "string" &&
    allowlist.has(claims.email.toLowerCase())
  );
}
