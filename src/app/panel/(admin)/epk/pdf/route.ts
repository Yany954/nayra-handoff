import { getEpkDocument } from "@/application/public-site";
import { requireAdmin } from "@/infrastructure/auth/session";
import { repositories } from "@/infrastructure/container";
import { renderEpkPdf } from "@/infrastructure/pdf/EpkDocument";

/** The EPK as a PDF for the manager to attach to her emails. Same data as /panel/epk. */
export async function GET() {
  await requireAdmin();
  const pdf = await renderEpkPdf(await getEpkDocument(repositories));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="EPK-Nayra-Lancheros.pdf"',
      // Private document: never stored by shared caches.
      "Cache-Control": "private, no-store",
    },
  });
}
