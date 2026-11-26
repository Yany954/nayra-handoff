import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { repositories } from "@/infrastructure/container";
import { displayHeading } from "@/presentation/ui/primitives";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Cómo tratamos los datos que envías en el formulario de contacto y las cookies del sitio.",
};

async function loadProfile() {
  "use cache";
  cacheLife("days");
  return repositories.getProfile();
}

const h2 = "m-0 font-display text-2xl font-bold";
const p = "m-0 text-base leading-[1.7] text-text-soft";

/** Ley 1581 de 2012 (habeas data) y Decreto 1377 de 2013: aviso de privacidad breve y claro. */
export default async function PrivacyPage() {
  const profile = await loadProfile();
  return (
    <main id="contenido" tabIndex={-1} className="mx-auto box-border flex w-full max-w-[760px] flex-1 flex-col gap-7 px-5 pb-20 pt-12 lg:pt-16">
      <h1 className={`${displayHeading} text-[44px] lg:text-[56px]`}>Privacidad</h1>
      <p className={p}>
        Este aviso explica qué datos recibimos en este sitio, para qué los usamos y cuáles son tus derechos, según la Ley 1581 de 2012
        de protección de datos personales de Colombia.
      </p>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>Responsable</h2>
        <p className={p}>
          La manager de {profile.name}, con base en {profile.base}.
          {profile.bookingEmail && <> Contacto: <a href={`mailto:${profile.bookingEmail}`} className="text-text-light underline">{profile.bookingEmail}</a>.</>}
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>Qué datos y para qué</h2>
        <p className={p}>
          Cuando envías el formulario de contacto recibimos tu nombre, teléfono o correo, el tipo y la fecha del evento, el municipio y
          tu mensaje. Los usamos solo para responderte sobre disponibilidad, formatos y condiciones de una presentación, y para hacer
          seguimiento a esa conversación. No los vendemos ni los compartimos con terceros con fines comerciales.
        </p>
        <p className={p}>
          Para evitar spam guardamos una huella cifrada de la conexión (no la dirección IP) durante unas horas.
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>Cookies y estadísticas</h2>
        <p className={p}>
          Solo si aceptas en el aviso de cookies usamos Google Analytics para saber cuántas personas visitan el sitio y qué secciones
          les interesan. Si rechazas, no se carga. Puedes cambiar tu decisión en «Preferencias de cookies», al pie de la página.
        </p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>Tus derechos</h2>
        <p className={p}>
          Puedes conocer, actualizar, rectificar o pedir que borremos tus datos, y revocar esta autorización, escribiendo al correo de
          contacto. Respondemos en los plazos de la ley (10 días hábiles para consultas y 15 para reclamos).
        </p>
      </section>
    </main>
  );
}
