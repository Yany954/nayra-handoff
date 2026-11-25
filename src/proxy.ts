import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check only: no session cookie, no panel. The real verification is
 * `requireAdmin()` in every panel page and Server Action.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("__session")) {
    return NextResponse.redirect(new URL("/panel/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel", "/panel/((?!login).*)"],
};
