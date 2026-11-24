import Image from "next/image";
import Link from "next/link";
import type { HomePageData } from "@/application/public-site";
import { formatShowDate } from "@/domain/rules/shows";
import { ArrowRightIcon, PlayIcon } from "@/presentation/ui/icons";
import { Pill } from "@/presentation/ui/primitives";

const glass = "border border-white/14 backdrop-blur-[14px]";

function LatestShowCard({ show }: { show: NonNullable<HomePageData["latestShow"]> }) {
  return (
    <div className={`z-10 flex flex-col gap-3 rounded-[22px] bg-[rgba(20,16,18,0.62)] p-3.5 lg:absolute lg:right-5 lg:top-5 lg:w-[300px] ${glass}`}>
      <div className="flex items-center gap-3">
        <Image
          src="/images/nayra-singing.jpg"
          alt=""
          width={56}
          height={56}
          className="size-14 rounded-xl object-cover object-[center_25%]"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted-on-dark">Último show</span>
          <span className="font-display text-[17px] font-bold">{show.venue}</span>
        </div>
      </div>
      {show.description && (
        <span className="text-[13px] leading-[1.4] text-text-subtle">{show.description}</span>
      )}
      {show.videoUrl && (
        <a
          href={show.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/12 text-sm font-medium text-text-light no-underline"
        >
          <PlayIcon />
          Ver video en vivo
        </a>
      )}
    </div>
  );
}

function UpcomingShows({ shows }: { shows: HomePageData["upcomingShows"] }) {
  return (
    <div
      id="shows"
      className={`z-10 flex scroll-mt-4 flex-col gap-1.5 rounded-card bg-[rgba(20,16,18,0.7)] p-[18px] lg:absolute lg:inset-x-5 lg:bottom-5 ${glass}`}
    >
      <div className="flex items-center justify-between gap-3 pb-1.5">
        <span className="text-[15px] font-semibold">Próximas fechas</span>
        <Link href="/#contacto" className="hit-44 text-[13px] text-text-subtle no-underline">
          Consultar disponibilidad →
        </Link>
      </div>
      {shows.length === 0 && (
        <p className="m-0 border-t border-white/10 py-2.5 text-[13px] text-muted-on-dark">
          Pronto anunciaremos nuevas fechas.
        </p>
      )}
      {shows.map((show, index) => {
        const { month, day } = formatShowDate(show.date!);
        const isLast = index === shows.length - 1;
        return (
          <div
            key={show.id}
            className={`flex items-center gap-3.5 border-t border-white/10 ${isLast ? "pt-2.5" : "py-2.5"}`}
          >
            <div className="flex w-12 shrink-0 flex-col items-center rounded-[10px] border border-white/16 py-1.5">
              <span className="text-[10px] text-muted-on-dark">{month}</span>
              <span className="text-lg font-bold">{day}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold">{show.city}</span>
              <span className="text-[13px] text-muted-on-dark">{show.venue}</span>
            </div>
            {show.status === "confirmado" ? (
              <span className="whitespace-nowrap rounded-full bg-text-light px-3 py-2 text-xs font-semibold text-ink">
                Confirmado
              </span>
            ) : (
              <span className="whitespace-nowrap rounded-full border border-white/22 px-3 py-2 text-xs text-text-light">
                Por confirmar
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Hero({ data }: { data: HomePageData }) {
  const { profile, latestShow, upcomingShows } = data;
  const [first, ...rest] = profile.name.split(" ");

  return (
    <section
      id="inicio"
      className="mx-auto box-border w-full max-w-[1360px] [--hero-h:max(100svh,720px)] lg:px-10 lg:pt-6"
    >
      <div className="relative flex flex-col lg:flex-row lg:items-stretch lg:gap-6">
        <div className="relative z-10 box-border flex min-h-[var(--hero-h)] min-w-0 flex-col justify-end gap-4 px-5 pb-7 pt-28 lg:min-h-0 lg:flex-[1_1_560px] lg:gap-7 lg:px-2 lg:pb-10 lg:pt-12">
          <div className="flex items-center gap-2 self-start rounded-full border border-white/18 bg-[rgba(20,16,18,0.5)] px-3 py-1.5 text-xs text-text-soft lg:border-white/14 lg:bg-white/5 lg:px-3.5 lg:py-2 lg:text-[13px] lg:text-text-subtle">
            <span className="size-[7px] rounded-full bg-accent lg:size-2" />
            <span className="lg:hidden">{profile.heroBadgeShort}</span>
            <span className="hidden lg:inline">{profile.heroBadge}</span>
          </div>
          <h1 className="m-0 font-display text-[58px] font-bold leading-[0.92] tracking-[-0.04em] lg:text-[clamp(84px,8.9vw,128px)] lg:leading-[0.9]">
            {first}
            <br />
            {rest.join(" ")}
          </h1>
          <p className="m-0 max-w-[520px] text-base leading-normal text-text-soft lg:text-xl lg:text-text-subtle">
            <span className="lg:hidden">{profile.taglineShort}</span>
            <span className="hidden lg:inline">{profile.tagline}</span>
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            <Link
              href="/#contacto"
              className="flex items-center justify-between gap-3 rounded-full bg-text-light py-1.5 pl-5 pr-1.5 font-semibold text-ink no-underline lg:justify-start lg:py-2 lg:pl-[22px] lg:pr-2"
            >
              Contrátala
              <span className="flex size-11 items-center justify-center rounded-full bg-ink text-text-light lg:size-10">
                <ArrowRightIcon />
              </span>
            </Link>
            <Link
              href="/repertorio"
              className="flex min-h-[52px] items-center justify-center rounded-full border border-white/22 px-[22px] font-medium text-text-light no-underline lg:min-h-14 lg:border-white/20"
            >
              Ver repertorio
            </Link>
          </div>
          <div className="hidden flex-wrap gap-2 lg:flex">
            {profile.heroGenres.map((genre) => (
              <Pill key={genre}>{genre}</Pill>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 px-5 pt-4 lg:relative lg:min-h-[760px] lg:flex-[1_1_520px] lg:overflow-hidden lg:rounded-hero lg:p-0">
          <div className="absolute inset-x-0 top-0 h-[var(--hero-h)] overflow-hidden lg:inset-0 lg:h-auto">
            <Image
              src="/images/nayra-stage.jpg"
              alt="Nayra Lancheros en tarima con micrófono, sonriendo"
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[center_15%] lg:object-[center_20%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,14,0.35)_0%,rgba(15,12,14,0)_22%,rgba(15,12,14,0)_38%,rgba(15,12,14,0.95)_72%)] lg:bg-[linear-gradient(180deg,rgba(15,12,14,0)_45%,rgba(15,12,14,0.85)_100%)]" />
          </div>
          {latestShow && <LatestShowCard show={latestShow} />}
          <UpcomingShows shows={upcomingShows} />
        </div>
      </div>
    </section>
  );
}
