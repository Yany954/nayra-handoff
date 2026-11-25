/** Pure allowlist check shared by both blocking functions (kept free of Firebase for testing). */
export function parseAllowlist(values: readonly string[]): Set<string> {
  return new Set(values.map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function isAllowedAdmin(
  user: { email?: string | null; emailVerified?: boolean },
  allowlist: Set<string>,
): boolean {
  if (!user.email || user.emailVerified !== true) return false;
  return allowlist.has(user.email.trim().toLowerCase());
}
