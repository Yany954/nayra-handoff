import Image from "next/image";
import type { HomePageData } from "@/application/public-site";
import { formatDuration } from "@/domain/rules/formats";
import { MusicIcon, PlayIcon } from "@/presentation/ui/icons";
import { Pill, Section, SectionHeading, cardDark, displayHeading } from "@/presentation/ui/primitives";

export function Achievements({ data }: { data: HomePageData }) {
  return (
    <Section className="flex flex-col gap-10">
      <SectionHeading>
        Logros. <span className="text-muted-heading">Una carrera que apenas empieza.</span>
      </SectionHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        {data.featuredAchievements.map((achievement) => {
          const highlighted = achievement.kind === "ganadora";
          return (
            <div
              key={achievement.id}
              className={`flex min-h-[220px] flex-col justify-between gap-10 rounded-card p-7 ${
                highlighted ? "bg-accent text-ink" : cardDark
              }`}
            >
              <span className={`text-[13px] font-semibold uppercase tracking-[0.08em] ${highlighted ? "" : "text-muted-on-dark"}`}>
                {achievement.label}
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-[30px] font-bold leading-[1.05]">{achievement.title}</span>
                <span className={`text-[15px] ${highlighted ? "" : "text-muted-on-dark"}`}>{achievement.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
      {data.otherAchievements.map((achievement) => (
        <div
          key={achievement.id}
          className="flex items-center gap-3 rounded-card-sm border border-white/10 px-[22px] py-[18px] text-[15px] text-text-subtle"
        >
          <MusicIcon />
          {achievement.title}
        </div>
      ))}
    </Section>
  );
}

export function Formats({ data }: { data: HomePageData }) {
  return (
    <Section className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading>Formatos del show</SectionHeading>
        <p className="m-0 max-w-[420px] text-base leading-normal text-muted-on-dark">
          Elige el formato según tu evento: desde una serenata íntima hasta una tarima de festival.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
        {data.formats.map((format) => (
          <div key={format.id} className={`flex flex-col gap-[18px] rounded-card p-7 ${cardDark}`}>
            <span className="font-display text-[26px] font-bold">{format.name}</span>
            <div className="flex flex-wrap gap-2">
              <Pill className="bg-white/8">{formatDuration(format)}</Pill>
              <Pill className="bg-white/8">{format.membersLabel}</Pill>
            </div>
            <span className="text-sm leading-normal text-muted-on-dark">{format.idealFor}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function LiveVideos({ data }: { data: HomePageData }) {
  const { featuredVideo, secondaryVideos } = data;
  return (
    <Section className="flex flex-col gap-8">
      <SectionHeading>En vivo</SectionHeading>
      <div className="flex flex-wrap gap-4">
        {featuredVideo && (
          <div className="relative min-h-[320px] flex-[2_1_100%] overflow-hidden rounded-image lg:min-h-[440px] lg:flex-[2_1_560px]">
            <Image
              src="/images/nayra-singing.jpg"
              alt="Nayra cantando bajo luces de tarima"
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-[rgba(15,12,14,0.35)]" />
            <a
              href={featuredVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Reproducir video: ${featuredVideo.title}`}
              className="absolute left-1/2 top-1/2 flex size-[84px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-text-light text-ink"
            >
              <PlayIcon size={30} />
            </a>
            <div className="absolute bottom-[22px] left-6 right-6 flex flex-col gap-1">
              <span className="font-display text-[22px] font-bold lg:text-[26px]">{featuredVideo.title}</span>
              <span className="text-sm text-text-subtle">{featuredVideo.context}</span>
            </div>
          </div>
        )}
        <div className="flex flex-[1_1_300px] flex-col gap-4">
          {secondaryVideos.map((video) => (
            <div key={video.id} className={`flex min-h-[212px] flex-1 flex-col justify-between rounded-card p-[22px] ${cardDark}`}>
              <span className="text-xs uppercase tracking-[0.08em] text-muted-on-dark">{video.context}</span>
              <span className="font-display text-[22px] font-bold">{video.title}</span>
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="hit-44 self-start text-sm text-text-light underline">
                Ver clip →
              </a>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function History({ data }: { data: HomePageData }) {
  const { profile } = data;
  const facts = [
    { label: "Origen · Base", value: `${profile.origin} · ${profile.base}` },
    { label: "Cobertura", value: profile.coverage },
    { label: "Géneros", value: profile.genresSummary },
  ];
  return (
    <section className="mt-20 bg-cream text-text-dark lg:mt-[120px]">
      <div className="mx-auto box-border flex max-w-[1360px] flex-wrap items-center gap-10 px-5 py-20 lg:gap-16 lg:px-12 lg:py-[110px]">
        <div className="relative h-[440px] min-w-0 flex-[1_1_100%] overflow-hidden rounded-image lg:h-[640px] lg:flex-[1_1_420px]">
          <Image
            src="/images/nayra-singing.jpg"
            alt="Nayra Lancheros cantando con los ojos cerrados"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-[center_25%]"
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_100%] flex-col gap-7 lg:flex-[1_1_520px]">
          <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-on-light">Su historia</span>
          <h2 className={`${displayHeading} text-[38px] sm:text-5xl lg:text-[60px]`}>{profile.historyHeading}</h2>
          {profile.bioLong.map((paragraph) => (
            <p key={paragraph} className="m-0 text-[17px] leading-[1.65] text-text-body lg:text-lg">
              {paragraph}
            </p>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-0.5 rounded-2xl bg-cream-deep px-5 py-4">
                <span className="text-xs text-muted-on-light">{fact.label}</span>
                <span className="font-semibold">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
