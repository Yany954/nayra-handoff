import { cacheLife } from "next/cache";
import { getHomePage } from "@/application/public-site";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { repositories } from "@/infrastructure/container";
import { Contact, Footer } from "@/presentation/components/home/Contact";
import { Hero } from "@/presentation/components/home/Hero";
import { submitBookingAction } from "./actions";
import {
  Achievements,
  Formats,
  Gallery,
  History,
  LiveVideos,
} from "@/presentation/components/home/Sections";

async function loadHome() {
  "use cache";
  // Refreshed daily so past shows leave "Próximas fechas" on their own.
  cacheLife("days");
  const today = toBogotaDateKey(new Date());
  return { data: await getHomePage(repositories, today), year: today.slice(0, 4) };
}

export default async function HomePage() {
  const { data, year } = await loadHome();
  return (
    <>
      <main id="contenido" tabIndex={-1} className="flex-1">
        <Hero data={data} />
        <Achievements data={data} />
        <Formats data={data} />
        <LiveVideos data={data} />
        <Gallery data={data} />
        <History data={data} />
        <Contact data={data} submit={submitBookingAction} />
      </main>
      <Footer data={data} year={year} />
    </>
  );
}
