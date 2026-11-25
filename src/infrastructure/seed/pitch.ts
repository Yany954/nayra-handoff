import type { PitchTemplates } from "@/domain/entities";

/**
 * Initial pitch templates. The shared body and signature are the manager's own text
 * (docs/content/pitch-base.md, first person, signed by Nayra); each recipient kind adds
 * its subject and one adapted paragraph. All editable in /panel/pitch.
 */
export const pitchSeed: PitchTemplates = {
  body: `{saludo}

Espero que se encuentre muy bien.

Mi nombre es Nayra Lancheros, cantante y estudiante de Música nacida en Bogotá y radicada en Curumaní, Cesar. Me pongo en contacto con usted para presentarle mi propuesta musical, un proyecto que conecta la riqueza de la capital con la fuerza rítmica del Caribe colombiano a través de la música vallenata, el canto de tamboras y la expresión folclórica.

{parrafo_evento}

A lo largo de mi trayectoria he sido galardonada con el primer lugar en el concurso Caribe Canta (Barranquilla) y me he destacado en los concursos de Mejor Voz Vallenata en certámenes regionales del Cesar (Becerril, Chiriguaná, San Roque, entre otros). Asimismo, desde 2023 formo parte de la Corporación Ballet Folclórico Tawanty como bailarina y cantante principal de tamboras.

Adjunto a este mensaje mi EPK (Electronic Press Kit) con mi biografía completa, ficha técnica y enlaces a mis interpretaciones.

Quedo a su entera disposición para conversar sobre posibles colaboraciones o presentaciones.

Agradeciendo de antemano su tiempo y atención,

Atentamente,

{firma}`,
  signature: `Nayra Lancheros
Cantante y Folclorista

Teléfono / WhatsApp: {whatsapp}
Correo: {correo}
Instagram: {instagram}
TikTok: {tiktok}
Facebook: {facebook}`,
  kinds: {
    festival: {
      subject: "Propuesta Artística: Nayra Lancheros | Cantante Vallenata",
      paragraph:
        "Me gustaría proponer mi show para la programación de {evento}. Puedo presentarme en estos formatos: {formatos}. También tengo un formato de tambora ideal para muestras culturales.",
    },
    corporativo: {
      subject: "Show en vivo para su evento — Nayra Lancheros",
      paragraph:
        "Para {evento} propongo un repertorio de vallenato, baladas y rancheras para todo público, en el formato que mejor se ajuste a su espacio: {formatos}.",
    },
    hotel: {
      subject: "Música en vivo para su espacio — Nayra Lancheros",
      paragraph:
        "Mi formato acústico funciona muy bien para cenas, terrazas y noches temáticas. Estos son los formatos disponibles: {formatos}.",
    },
    privado: {
      subject: "Nayra Lancheros para su celebración",
      paragraph:
        "Me encantaría acompañar su celebración con vallenato, rancheras, baladas y canciones especiales para bodas, 15 años y cumpleaños. Formatos disponibles: {formatos}.",
    },
  },
};
