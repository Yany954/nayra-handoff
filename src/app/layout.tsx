import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "./site-url";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Nayra Lancheros",
    title: "Nayra Lancheros — cantante para tu evento",
    description: "Vallenato, rancheras, baladas y tambora desde Curumaní, Cesar. Festivales, bodas, hoteles y eventos corporativos.",
  },
  twitter: { card: "summary_large_image" },
  title: {
    default: "Nayra Lancheros",
    template: "%s · Nayra Lancheros",
  },
  description:
    "Cantante de vallenato, rancheras, baladas y tambora desde Curumaní, Cesar. Contrátala para tu evento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="es"
      className={`${bricolage.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-full bg-text-light px-5 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
