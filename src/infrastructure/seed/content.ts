/**
 * Local seed for Phase 2, transcribed from design/mockups.
 *
 * PENDING REVIEW: the public mockups do not mark which values are real.
 * Confirm shows, contact details, video links and achievements with the
 * manager before any deploy. `contactConfirmed: false` keeps the phone and
 * email from becoming live links.
 */

const YOUTUBE_URL = "https://www.youtube.com/@nayra-w9z";
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
    "Nacida en Bogotá y radicada en Curumaní, Cesar, desde los 13 años, donde se enamoró del folclor. Ganadora del concurso Caribe Canta y finalista de V Latin Music. Interpreta vallenato, rancheras, baladas y tambora con una voz potente y afinada.",
  bioLong: [
    "Nayra Sofía Lancheros Yépez nació en Bogotá y a los 13 años se mudó a Curumaní, Cesar. Allí se enamoró del folclor y del vallenato. Hoy en la región la conocen por su voz potente, su afinación y la facilidad con la que pasa del vallenato a la música folclórica.",
    "Ha ganado el concurso Caribe Canta, ha llegado a finales de voces en Bucaramanga y ha compartido tarima con artistas reconocidos del vallenato en los festivales de su tierra.",
  ],
  origin: "Bogotá",
  base: "Curumaní, Cesar",
  coverage: "Cesar y región Caribe",
  genresSummary: "Vallenato · Ranchera · Balada · Tambora",
  socials: {
    instagram: {
      handle: "@nayralancheros",
      url: "https://www.instagram.com/nayralancheros",
    },
    tiktok: { handle: "@nayra..lan", url: TIKTOK_URL },
    youtube: { handle: "@nayra-w9z", url: YOUTUBE_URL },
  },
  bookingEmail: "booking@nayralancheros.com",
  whatsapp: "+57 300 000 0000",
  contactConfirmed: false,
};

export const achievementsSeed = [
  {
    id: "caribe-canta",
    title: "1.er lugar",
    subtitle: "Concurso Caribe Canta",
    kind: "ganadora",
    label: "Ganadora",
    epkLine: "1.er lugar — Concurso Caribe Canta",
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
    id: "rafael-orozco",
    title: "Voces Rafael Orozco Maestre",
    subtitle: "Concurso de voces",
    kind: "participante",
    label: "Participante destacada",
    epkLine: "Participante destacada — Concurso de Voces Rafael Orozco Maestre",
    featured: true,
    order: 3,
  },
  {
    id: "natalia-curvelo",
    title: "Natalia Curvelo",
    subtitle: "Festival Folclórico de Curumaní",
    kind: "tarima",
    label: "Tarima compartida",
    epkLine:
      "Artista local invitada en el Festival Folclórico de Curumaní, junto a Natalia Curvelo",
    featured: true,
    order: 4,
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
    order: 5,
  },
];

export const showsSeed = [
  {
    id: "festival-curumani",
    venue: "Festival Folclórico de Curumaní",
    city: "Curumaní, Cesar",
    date: null,
    status: "confirmado",
    description: "Compartió tarima con Natalia Curvelo como artista local invitada.",
    videoUrl: YOUTUBE_URL,
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
    id: "el-me-mintio",
    title: "\"Él me mintió\" — Final V Latin Music",
    context: "Bucaramanga · YouTube",
    url: YOUTUBE_URL,
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
    context: "YouTube · @nayra-w9z",
    url: YOUTUBE_URL,
    featured: false,
    order: 3,
  },
];

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
