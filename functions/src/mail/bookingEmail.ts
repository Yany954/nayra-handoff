/** A booking request as stored by the site's contact form (validated there). */
export type BookingRequestDoc = {
  name: string;
  phone: string | null;
  email: string | null;
  eventType: string;
  eventDate: string;
  municipality: string;
  message: string;
};

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const spell = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return m ? `${day} de ${MONTHS[m - 1]} de ${y}` : d;
};
/** One line, no control characters: user text must never break the email headers. */
const oneLine = (v: string) => v.replace(/[\r\n\t]+/g, " ").trim().slice(0, 140);
const isEmail = (v: string | null): v is string => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Plain text only, so text written by strangers can never inject HTML or links styled as buttons. */
export function buildBookingEmail(request: BookingRequestDoc, panelUrl: string) {
  const digits = request.phone?.replace(/\D/g, "") ?? "";
  const whatsapp = digits ? `https://wa.me/${digits.length === 10 ? `57${digits}` : digits}` : null;
  const text = [
    `Nueva solicitud desde el sitio de Nayra Lancheros`,
    ``,
    `Nombre: ${oneLine(request.name)}`,
    `Evento: ${oneLine(request.eventType)} — ${spell(request.eventDate)}`,
    `Municipio: ${oneLine(request.municipality)}`,
    request.phone ? `Teléfono: ${oneLine(request.phone)}${whatsapp ? `  (WhatsApp: ${whatsapp})` : ""}` : null,
    request.email ? `Correo: ${oneLine(request.email)}` : null,
    ``,
    `Mensaje:`,
    request.message.slice(0, 2000),
    ``,
    `Ya está en el panel como Prospecto: ${panelUrl}`,
    isEmail(request.email) ? `Puedes responder este correo: le llega directo a ${request.email}.` : `No dejó correo: respóndele por teléfono o WhatsApp.`,
  ]
    .filter((line) => line !== null)
    .join("\n");
  return {
    subject: `Nueva solicitud: ${oneLine(request.eventType)} en ${oneLine(request.municipality)} (${spell(request.eventDate)})`,
    text,
    replyTo: isEmail(request.email) ? request.email : undefined,
  };
}
