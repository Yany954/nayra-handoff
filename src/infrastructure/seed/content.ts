/**
 * Local seed until Phase 3 moves it to Firestore.
 *
 * Sources: bios, contact, Facebook, Caribe Canta, Mejor Voz, Tawanty and
 * Rondas Infantiles come from the manager (2026-11-23); the repertoire is
 * confirmed real. Everything else comes from the mockups.
 *
 * The latest show (Festival Folclórico de Curumaní, local artist) is confirmed.
 *
 * PENDING REVIEW before deploy: upcoming shows, the TikTok handle, the two
 * secondary videos, and the V Latin Music, Natalia Curvelo, Rafael Orozco
 * and COLCARMEN achievements.
 */

const YOUTUBE_URL = "https://www.youtube.com/@NAYRA-Lan";
const TIKTOK_URL = "https://www.tiktok.com/@nayra..lan";

export const profileSeed = {
  name: "Nayra Lancheros",
  heroBadge: "Primer lugar · Concurso Caribe Canta",
  heroBadgeShort: "Primer lugar · Caribe Canta",
  tagline:
    "Una voz potente del Cesar. Vallenato, rancheras, baladas y tambora — desde Curumaní hasta la tarima de tu evento.",
  taglineShort:
    "Vallenato, rancheras, baladas y tambora — desde Curumaní hasta la tarima de tu evento.",
  heroGenres: ["Vallenato", "Rancheras", "Baladas", "Tambora · Cantadora"],
  historyHeading: "De Bogotá a Curumaní: ahí se enamoró del vallenato.",
  bioShort:
    "Nayra Lancheros es cantante y estudiante de Música, nacida en Bogotá y radicada en Curumaní, Cesar. Desde los 6 años ha forjado una voz versátil y un estilo propio, con formación en técnica vocal vallenata, guitarra, danzas folclóricas y cantos de tambora. Ganadora del primer lugar en Caribe Canta y artista invitada local, también disfruta pintar en su tiempo libre.",
  bioLong: [
    "Nayra Lancheros (n. 2 de octubre de 2008, Bogotá) es cantante y estudiante de segundo semestre de Música, con una propuesta artística marcada por el cruce entre la capital y la tierra de su madre, el departamento del Cesar. Bachiller académica del Colegio Monterrosales de Bogotá (2025), inició su camino musical a los 6 años en la Escuela de Formación AMA, presentándose en escenarios como el Teatro Santafé y participando activamente en la escuela musical del Colegio Nuestra Señora del Pilar Chapinero.",
    "En 2020 se radicó en Curumaní, Cesar, donde fortaleció su formación en guitarra y técnica vocal enfocada en la música vallenata en la Casa de la Cultura. Desde 2023 integra la Corporación Ballet Folclórico Tawanty, destacando tanto en danzas folclóricas como en el canto de tamboras tradicionales.",
    "Reconocida por su voz versátil, carisma y estilo propio, ha participado en certámenes de \"Mejor Voz\" en festivales regionales (Rinconhondo, La Aurora, San Roque, Sabagrande, Santa Isabel, Chiriguaná y Becerril), en el concurso VLatin Music y obtuvo el primer lugar en el concurso Caribe Canta en Barranquilla. En 2025 y 2026 se desempeñó como cantante local en el Festival de Juegos y Rondas Infantiles de Curumaní. Fuera de los escenarios, explora distintas técnicas de pintura.",
  ],
  origin: "Bogotá",
  base: "Curumaní, Cesar",
  coverage: "Cesar y región Caribe",
  genresSummary: "Vallenato · Ranchera · Balada · Tambora",
  socials: [
    {
      network: "instagram",
      handle: "@nayralancheros",
      url: "https://www.instagram.com/nayralancheros",
    },
    { network: "tiktok", handle: "@nayra..lan", url: TIKTOK_URL },
    { network: "youtube", handle: "@NAYRA-Lan", url: YOUTUBE_URL },
    {
      network: "facebook",
      handle: "Nayra Lancheros",
      url: "https://www.facebook.com/share/1PrAMnQBS4/",
    },
  ],
  bookingEmail: null,
  whatsapp: "+57 317 470 3402",
};

export const achievementsSeed = [
  {
    id: "caribe-canta",
    title: "1.er lugar",
    subtitle: "Concurso Caribe Canta · Barranquilla",
    kind: "ganadora",
    label: "Ganadora",
    epkLine: "1.er lugar — Concurso Caribe Canta, Barranquilla",
    featured: true,
    order: 1,
  },
  {
    id: "v-latin-music",
    title: "V Latin Music",
    subtitle: "Concurso de voces · Bucaramanga",
    kind: "finalista",
    label: "Finalista",
    epkLine: "Finalista — Concurso de voces V Latin Music, Bucaramanga",
    featured: true,
    order: 2,
  },
  {
    id: "mejor-voz-regional",
    title: "Mejor Voz Vallenata",
    subtitle: "7 festivales regionales · Becerril, Chiriguaná, San Roque y más",
    kind: "participante",
    label: "Concursante",
    epkLine:
      "Concursante de Mejor Voz en festivales de Rinconhondo, La Aurora, San Roque, Sabagrande, Santa Isabel, Chiriguaná y Becerril",
    featured: true,
    order: 3,
  },
  {
    id: "tawanty",
    title: "Ballet Folclórico Tawanty",
    subtitle: "Bailarina y cantante principal de tamboras",
    kind: "reconocimiento",
    label: "Desde 2023",
    epkLine:
      "Bailarina y cantante principal de tamboras en la Corporación Ballet Folclórico Tawanty (desde 2023)",
    featured: true,
    order: 4,
  },
  {
    id: "rondas-infantiles",
    title:
      "Cantante local en el Festival de Juegos y Rondas Infantiles de Curumaní (2025 y 2026).",
    subtitle: "Festival de Juegos y Rondas Infantiles",
    kind: "tarima",
    label: "Tarima",
    epkLine: "Cantante local en el Festival de Juegos y Rondas Infantiles de Curumaní (2025 y 2026)",
    featured: false,
    order: 5,
  },
  {
    id: "natalia-curvelo",
    title: "Artista local invitada en el Festival Folclórico de Curumaní, junto a Natalia Curvelo.",
    subtitle: "Festival Folclórico de Curumaní",
    kind: "tarima",
    label: "Tarima compartida",
    epkLine:
      "Artista local invitada en el Festival Folclórico de Curumaní, junto a Natalia Curvelo",
    featured: false,
    order: 6,
  },
  {
    id: "rafael-orozco",
    title: "Participante destacada en el Concurso de Voces Rafael Orozco Maestre.",
    subtitle: "Concurso de voces",
    kind: "participante",
    label: "Participante destacada",
    epkLine: "Participante destacada — Concurso de Voces Rafael Orozco Maestre",
    featured: false,
    order: 7,
  },
  {
    id: "himno-colcarmen",
    title:
      "Intérprete del himno de la Institución Educativa Nuestra Señora del Carmen (COLCARMEN), Pailitas.",
    subtitle: "COLCARMEN, Pailitas",
    kind: "reconocimiento",
    label: "Reconocimiento",
    epkLine: "Intérprete del himno de COLCARMEN, Pailitas",
    featured: false,
    order: 8,
  },
];

export const showsSeed = [
  {
    id: "festival-curumani",
    venue: "Festival Folclórico de Curumaní",
    city: "Curumaní, Cesar",
    date: null,
    status: "confirmado",
    description: "Se presentó como artista local del festival.",
  },
  {
    id: "fin-de-ano-curumani",
    venue: "Fiestas de fin de año",
    city: "Curumaní, Cesar",
    date: "2026-12-07",
    status: "confirmado",
  },
  {
    id: "privado-pailitas",
    venue: "Evento privado",
    city: "Pailitas, Cesar",
    date: "2026-12-20",
    status: "confirmado",
  },
  {
    id: "feria-chimichagua",
    venue: "Feria municipal",
    city: "Chimichagua, Cesar",
    date: "2027-01-11",
    status: "por_confirmar",
  },
];

const songRows: [string, string, string, boolean][] = [
  ["Sigo esperando", "Fabián Corrales", "Vallenato", true],
  ["A tu lado", "Los Betos", "Vallenato", true],
  ["Culpa de los dos", "Silvestre Dangond", "Vallenato", true],
  ["Te amaría", "Adriana Lucía", "Vallenato", true],
  ["Mix: Mi compadre se cayó / Diciembre llegó", "Moisés Angulo", "Vallenato", true],
  ["Mañanitas de invierno", "Los Hermanos Zuleta", "Vallenato", true],
  ["Mix ranchenato: Como la flor / Bidi bidi bom bom", "Selena", "Rancheras", true],
  ["El vendaval", "Farid Ortiz", "Vallenato", true],
  ["Las mañanitas", "Tradicional", "Celebraciones", false],
  ["En tu día", "Pedro Infante", "Celebraciones", false],
  ["Tu fiesta", "Jessi Uribe", "Celebraciones", false],
  ["Es mi niña bonita", "Repertorio general", "Celebraciones", false],
  ["Quince primaveras", "Repertorio general", "Celebraciones", false],
  ["Te lo pido por favor", "Repertorio general", "Rancheras", false],
  ["El rey", "Repertorio general", "Rancheras", false],
  ["Cómo te pago", "Repertorio general", "Rancheras", false],
  ["Tu sangre en mi cuerpo", "Repertorio general", "Rancheras", false],
  ["Si nos dejan", "Repertorio general", "Rancheras", false],
  ["Viejo, mi querido viejo", "Repertorio general", "Baladas", false],
  ["Sabes una cosa", "Repertorio general", "Baladas", false],
  ["Solo para ti", "Rafael Orozco", "Vallenato", false],
  ["Negrita de mis amores", "Repertorio general", "Vallenato", false],
  ["Se me queman las manos", "Repertorio general", "Vallenato", false],
];

export const songsSeed = songRows.map(([title, artist, genre, inMainShow], i) => ({
  id: `song-${String(i + 1).padStart(2, "0")}`,
  title,
  artist,
  genre,
  inMainShow,
  order: i + 1,
}));

export const formatsSeed = [
  {
    id: "solista",
    name: "Solista con pista",
    shortName: "Pista",
    durationMin: 45,
    durationMax: 45,
    membersLabel: "1 artista",
    membersCount: 1,
    idealFor: "Ideal para cumpleaños, 15 años, bodas y eventos corporativos.",
    order: 1,
  },
  {
    id: "acustico",
    name: "Acústico",
    shortName: "Acústico",
    durationMin: 30,
    durationMax: 45,
    membersLabel: "Voz + guitarra",
    membersCount: 2,
    idealFor: "Para hoteles, restaurantes, serenatas y cenas privadas.",
    order: 2,
  },
  {
    id: "conjunto",
    name: "Con conjunto vallenato",
    shortName: "Conjunto",
    durationMin: 60,
    durationMax: 90,
    membersLabel: "5 músicos",
    membersCount: 5,
    idealFor:
      "Caja, guacharaca, acordeón y bajo. Para festivales, ferias y fiestas patronales.",
    order: 3,
  },
  {
    id: "tambora",
    name: "Tambora",
    shortName: "Tambora",
    durationMin: 30,
    durationMax: 30,
    membersLabel: "Voz + 3 tamboreros",
    membersCount: 4,
    idealFor: "Baile cantao de la ribera. Para festivales de tambora y muestras culturales.",
    order: 4,
  },
];

export const videosSeed = [
  {
    id: "si-no-te-tengo",
    title: "\"Si no te tengo\"",
    context: "YouTube · @NAYRA-Lan",
    url: "https://youtu.be/A9vZxH2VM-g",
    featured: true,
    order: 1,
  },
  {
    id: "lleno-de-ti",
    title: "\"Lleno de ti\" — Concurso de voces",
    context: "TikTok · @nayra..lan",
    url: TIKTOK_URL,
    featured: false,
    order: 2,
  },
  {
    id: "la-cigarra",
    title: "\"La cigarra\" — Presentación en vivo",
    context: "YouTube · @NAYRA-Lan",
    url: YOUTUBE_URL,
    featured: false,
    order: 3,
  },
];

const galleryRows: [string, string][] = [
  ["22-gesto-de-paz", "Nayra sonríe y hace el gesto de paz con el micrófono en la mano"],
  ["31-conjunto-azul", "Nayra canta con el conjunto vallenato bajo luces azules"],
  ["11-blanco-y-negro", "Retrato en blanco y negro de Nayra cantando a contraluz"],
  ["16-festival-publico", "Nayra canta frente al público en un festival al aire libre"],
  ["26-corazon", "Nayra forma un corazón con las manos sobre la tarima"],
  ["34-desfile-folclorico", "Nayra canta en un desfile folclórico con traje típico"],
  ["03-sonrisa-luces", "Nayra sonríe en tarima bajo luces de colores"],
  ["30-luz-calida", "Nayra canta junto a la banda bajo luz cálida"],
  ["20-brazos-arriba", "Nayra levanta los brazos mientras canta bajo las luces"],
  ["29-foto", "Foto de prensa de Nayra cantando con vestido azul sobre fondo blanco"],
  ["32-foto", "Foto de prensa de Nayra de cuerpo entero con enterizo azul"],
  ["33-foto", "Foto de prensa de Nayra posando con el micrófono"],
  ["02-foto", "Nayra canta junto al acordeonero con el escenario iluminado en verde"],
  ["08-foto", "Nayra se toca el cabello mientras sonríe bajo luces azules"],
  ["10-foto", "Nayra canta sosteniendo el micrófono bajo luces azules"],
  ["13-foto", "Nayra sonríe y extiende la mano hacia el público"],
  ["15-foto", "Un asistente graba a Nayra con su celular durante el show"],
  ["17-foto", "Retrato en blanco y negro de Nayra cantando bajo los reflectores"],
  ["18-foto", "Nayra canta con intensidad bajo una luz blanca"],
  ["23-foto", "Nayra canta frente al micrófono de pedestal bajo luces azules"],
  ["24-foto", "Nayra canta con la mano en el pecho"],
  ["27-foto", "Nayra hace el gesto de paz mientras sonríe en tarima"],
  ["35-foto", "Nayra lanza un beso en un lugar con luces moradas"],
];

export const gallerySeed = galleryRows.map(([file, alt], i) => ({
  id: file,
  src: `/images/gallery/${file}.jpg`,
  alt,
  order: i + 1,
}));

export const epkSeed = {
  eyebrow: "Kit de prensa · 2026",
  intro: "Todo lo que un promotor necesita para contratar a Nayra, en un solo lugar.",
  coverageStat: "Cesar",
  coverageStatLabel: "y región Caribe",
  rate: "A convenir según formato y distancia",
  technicalRider: [
    "2 micrófonos inalámbricos de mano (voz principal + respaldo)",
    "2 monitores de piso o in-ear",
    "Consola de mínimo 12 canales con ingeniero de sonido",
    "Entrada estéreo para pista (USB o laptop)",
    "Formato conjunto: 5 líneas adicionales (acordeón, caja, guacharaca, bajo, coro)",
  ],
  hospitalityRider: [
    "Camerino con espejo, iluminación y toma eléctrica",
    "Agua y alimentación para el equipo",
    "Transporte para eventos a más de 50 km de Curumaní",
    "Alojamiento si el evento queda a más de 3 horas",
    "Prueba de sonido de 30 minutos antes del show",
  ],
};
