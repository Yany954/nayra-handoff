import type { HomePageData } from "@/application/public-site";
import type { SocialNetwork } from "@/domain/entities";
import { toWhatsAppNumber } from "@/domain/rules/media";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/presentation/ui/icons";
import { EventDateInput } from "@/presentation/components/home/EventDateInput";
import { SectionHeading, cardDark } from "@/presentation/ui/primitives";

const labelClass = "flex flex-col gap-2 text-[13px] text-muted-on-dark";
const fieldClass =
  "rounded-xl border border-white/16 bg-field text-base text-text-light [color-scheme:dark] placeholder:text-muted-on-dark lg:text-[15px]";
const inputClass = `${fieldClass} min-h-12 px-3.5`;

export const SOCIAL_META: Record<SocialNetwork, { name: string; Icon: (props: { size?: number }) => React.JSX.Element }> = {
  instagram: { name: "Instagram", Icon: InstagramIcon },
  tiktok: { name: "TikTok", Icon: TikTokIcon },
  youtube: { name: "YouTube", Icon: YouTubeIcon },
  facebook: { name: "Facebook", Icon: FacebookIcon },
};

function ContactChannel({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-[0.08em] text-muted-on-dark">{label}</span>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="hit-44 self-start break-words text-lg text-text-light underline"
      >
        {value}
      </a>
    </div>
  );
}

export function Contact({ data }: { data: HomePageData }) {
  const { profile } = data;

  return (
    <section
      id="contacto"
      className="mx-auto box-border flex w-full max-w-[1360px] scroll-mt-4 flex-wrap gap-12 px-5 py-20 lg:px-12 lg:py-[120px]"
    >
      <div className="flex min-w-0 flex-[1_1_100%] flex-col gap-6 lg:flex-[1_1_380px]">
        <SectionHeading>¿Tienes un evento?</SectionHeading>
        <p className="m-0 text-[17px] leading-[1.6] text-muted-on-dark">
          Cuéntanos la fecha y el lugar. La manager te responde con disponibilidad y formatos.
        </p>
        <div className="flex flex-col gap-3.5 pt-2">
          {profile.bookingEmail && (
            <ContactChannel label="Booking" href={`mailto:${profile.bookingEmail}`} value={profile.bookingEmail} />
          )}
          {profile.whatsapp && (
            <ContactChannel
              label="WhatsApp"
              href={`https://wa.me/${toWhatsAppNumber(profile.whatsapp)}`}
              value={profile.whatsapp}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2.5 pt-2">
          {profile.socials.map(({ network, handle, url }) => {
            const { name, Icon } = SOCIAL_META[network];
            return (
              <a
                key={network}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} ${handle}`}
                className="flex size-12 items-center justify-center rounded-full border border-white/18 text-text-light"
              >
                <Icon />
              </a>
            );
          })}
        </div>
      </div>

      <form className={`grid min-w-0 flex-[1_1_100%] grid-cols-1 gap-4 rounded-image p-5 sm:grid-cols-2 sm:p-8 lg:flex-[1_1_520px] ${cardDark}`}>
        <label className={labelClass}>
          Nombre
          <input type="text" name="name" autoComplete="name" placeholder="Tu nombre" className={inputClass} />
        </label>
        <label className={labelClass}>
          Tipo de evento
          <select name="eventType" className={`${fieldClass} min-h-12 px-3`}>
            <option>Festival / feria</option>
            <option>Evento corporativo</option>
            <option>Hotel / restaurante</option>
            <option>Boda / 15 años / cumpleaños</option>
          </select>
        </label>
        <label className={labelClass}>
          Fecha
          <EventDateInput className={`${inputClass} min-w-0`} />
        </label>
        <label className={labelClass}>
          Municipio
          <input type="text" name="municipality" placeholder="Ej. Valledupar" className={inputClass} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Mensaje
          <textarea name="message" rows={4} placeholder="Cuéntanos del evento" className={`${fieldClass} resize-y px-3.5 py-3`} />
        </label>
        <button
          type="button"
          aria-disabled="true"
          title="El envío se activa en una fase posterior"
          className="min-h-[52px] cursor-not-allowed rounded-full border-0 bg-accent text-base font-semibold text-ink sm:col-span-2"
        >
          Enviar solicitud
        </button>
      </form>
    </section>
  );
}

export function Footer({ data, year }: { data: HomePageData; year: string }) {
  const { profile } = data;
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto box-border flex max-w-[1360px] flex-wrap justify-between gap-4 px-5 py-8 text-sm text-muted-on-dark lg:px-12">
        <span>© {year} {profile.name} · {profile.base}</span>
        <span className="flex flex-wrap gap-1.5">
          {profile.socials.map((link, index) => (
            <span key={link.network} className="flex gap-1.5">
              {index > 0 && <span aria-hidden="true">·</span>}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hit-44 no-underline hover:text-text-light">
                {SOCIAL_META[link.network].name}
              </a>
            </span>
          ))}
        </span>
      </div>
    </footer>
  );
}
