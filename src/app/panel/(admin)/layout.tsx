import { Suspense, type ReactNode } from "react";
import { requireAdmin } from "@/infrastructure/auth/session";
import { repositories } from "@/infrastructure/container";
import { PanelShell } from "@/presentation/components/panel/PanelShell";
import { signOut } from "./actions";
import PanelLoading from "./loading";

/**
 * Session reads happen at request time, so they stream in behind Suspense (Cache Components).
 * loading.tsx adds the boundary below this layout, which client navigations between panel pages need.
 */
async function AdminGate({ children }: { children: ReactNode }) {
  await requireAdmin();
  return children;
}

async function BookingEmail() {
  const profile = await repositories.getProfile();
  return profile.bookingEmail ?? "Sin configurar";
}


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
      <Suspense fallback={<PanelLoading />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </PanelShell>
  );
}
