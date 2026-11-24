import type { Metadata } from "next";
import Image from "next/image";
import { getEpkPage } from "@/application/public-site";
import { repositories } from "@/infrastructure/container";
import { Eyebrow, Section, cardDark, displayHeading } from "@/presentation/ui/primitives";

export const metadata: Metadata = {
  title: "EPK",
  description: "Kit de prensa de Nayra Lancheros: bio, logros, formatos y rider para promotores.",
};

const riderList = "m-0 flex list-disc flex-col gap-2.5 pl-5 text-[15px] leading-normal text-text-soft";

export default async function EpkPage() {
  const { profile, epk, achievements, formatsSummary } = await getEpkPage(repositories);

  const stats = [
    { value: String(formatsSummary.count), label: "formatos" },
    { value: formatsSummary.durationRange, label: "minutos" },
    { value: epk.coverageStat, label: epk.coverageStatLabel },
  ];
  const facts = [
    { label: "Ciudad base", value: profile.base },
    { label: "Géneros", value: "Vallenato, ranchera, balada, tambora" },
    { label: "Formatos", value: formatsSummary.names },
    { label: "Duración", value: formatsSummary.durations },
    { label: "Integrantes", value: formatsSummary.members },
    { label: "Tarifa", value: epk.rate },
    profile.bookingEmail
      ? { label: "Booking", value: profile.bookingEmail }
      : profile.whatsapp
        ? { label: "Booking", value: `WhatsApp ${profile.whatsapp}` }
        : null,
  ].filter((fact) => fact !== null);

  return (
    <main className="flex-1 pb-20 lg:pb-[120px]">
      <section className="mx-auto box-border max-w-[1360px] px-3.5 pt-4 lg:px-10 lg:pt-6">
        <div className="relative flex min-h-[460px] items-end overflow-hidden rounded-hero">
          <Image
            quality={90}
            src="/images/nayra-singing.jpg"
            alt="Nayra Lancheros cantando en tarima"
            fill
            preload
            sizes="(min-width: 1360px) 1280px, 100vw"
            className="object-cover object-[center_22%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,12,14,0.92)_0%,rgba(15,12,14,0.55)_55%,rgba(15,12,14,0.1)_100%)]" />
          <div className="relative box-border flex w-full flex-wrap items-end justify-between gap-8 p-6 lg:p-12">
            <div className="flex max-w-[640px] flex-col gap-3.5">
              <span className="text-xs uppercase tracking-[0.14em] text-text-subtle">{epk.eyebrow}</span>
              <h1 className="m-0 font-display text-[64px] font-bold leading-[0.95] tracking-[-0.04em] lg:text-[96px]">EPK</h1>
              <p className="m-0 text-lg leading-[1.55] text-text-soft">{epk.intro}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5 rounded-2xl border border-white/14 bg-[rgba(20,16,18,0.6)] px-[18px] py-3.5 backdrop-blur-md">
                  <span className="font-display text-[26px] font-bold">{stat.value}</span>
                  <span className="text-xs text-text-subtle">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section className="flex flex-wrap gap-12 lg:!pt-24">
        <div className="flex min-w-0 flex-[1_1_100%] flex-col gap-5 lg:flex-[3_1_520px]">
          <Eyebrow>Bio corta</Eyebrow>
          <p className="m-0 font-display text-[24px] font-medium leading-[1.3] lg:text-[30px]">{profile.bioShort}</p>
          <Eyebrow className="pt-4 text-muted-on-dark">Logros</Eyebrow>
          <ul className="m-0 flex list-disc flex-col gap-2.5 pl-5 text-base leading-normal text-text-soft">
            {achievements.map((achievement) => (
              <li key={achievement.id}>{achievement.epkLine}</li>
            ))}
          </ul>
        </div>
        <div className={`flex min-w-0 flex-[1_1_100%] flex-col rounded-card p-7 lg:flex-[2_1_360px] ${cardDark}`}>
          <Eyebrow className="pb-3 text-muted-on-dark">Datos rápidos</Eyebrow>
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`flex justify-between gap-4 border-t border-white/10 ${index === facts.length - 1 ? "pt-3.5" : "py-3.5"}`}
            >
              <span className="shrink-0 text-muted-on-dark">{fact.label}</span>
              <span className="min-w-0 break-words text-right font-semibold">{fact.value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section className="flex flex-col gap-7 lg:!pt-24">
        <h2 className={`${displayHeading} text-[40px] lg:text-[56px]`}>Rider</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4">
          <div className={`flex flex-col gap-4 rounded-card p-7 ${cardDark}`}>
            <h3 className="m-0 font-display text-2xl font-bold">Técnico</h3>
            <ul className={riderList}>
              {epk.technicalRider.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <button
              type="button"
              disabled
              title="Disponible próximamente"
              className="hit-44 cursor-not-allowed self-start border-0 bg-transparent p-0 text-sm text-text-light underline opacity-60"
            >
              Descargar input list →
            </button>
          </div>
          <div className={`flex flex-col gap-4 rounded-card p-7 ${cardDark}`}>
            <h3 className="m-0 font-display text-2xl font-bold">Hospitalidad y logística</h3>
            <ul className={riderList}>
              {epk.hospitalityRider.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </Section>
    </main>
  );
}
