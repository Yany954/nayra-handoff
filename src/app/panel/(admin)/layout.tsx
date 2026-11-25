import { Suspense, type ReactNode } from "react";
import { repositories } from "@/infrastructure/container";
import { PanelShell } from "@/presentation/components/panel/PanelShell";
import { signOut } from "./actions";

async function BookingEmail() {
  const profile = await repositories.getProfile();
  return profile.bookingEmail ?? "Sin configurar";
}

/**
 * The shell holds no private data. Every page under (admin) calls `requireAdmin()` itself
 * (enforced by panel-guard.test.ts) inside the loading.tsx Suspense boundary, which is
 * what both direct visits and client navigations between panel pages need.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PanelShell
      signOut={signOut}
      bookingEmail={
        <Suspense fallback="…">
          <BookingEmail />
        </Suspense>
      }
    >
      {children}
    </PanelShell>
  );
}
