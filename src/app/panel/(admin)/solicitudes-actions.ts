"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/session";
import { adminRepositories } from "@/infrastructure/container";
import { isDocId } from "@/infrastructure/schemas/form-data";

/** «Marcar revisada» on the panel home: the request leaves «Solicitudes nuevas». */
export async function markRequestReviewedAction(id: string): Promise<void> {
  await requireAdmin();
  if (!isDocId(id)) return;
  await adminRepositories().markBookingRequestReviewed(id);
  refresh();
}
