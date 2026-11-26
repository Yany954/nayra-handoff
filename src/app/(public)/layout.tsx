import { getSiteChrome } from "@/application/public-site";
import { repositories } from "@/infrastructure/container";
import { Analytics } from "@/presentation/components/analytics/Analytics";
import { SiteNav } from "@/presentation/components/layout/SiteNav";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const { name } = await getSiteChrome(repositories);

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-ink text-text-light">
      <SiteNav name={name} />
      {children}
      <Analytics measurementId={process.env.NEXT_PUBLIC_GA_ID || null} />
    </div>
  );
}
