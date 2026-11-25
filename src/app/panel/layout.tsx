import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: LayoutProps<"/panel">) {
  return <div className="flex min-h-full flex-1 flex-col bg-cream text-text-dark">{children}</div>;
}
