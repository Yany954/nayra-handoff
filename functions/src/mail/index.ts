import { logger } from "firebase-functions";
import { defineSecret, defineString } from "firebase-functions/params";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import nodemailer from "nodemailer";
import { buildBookingEmail, type BookingRequestDoc } from "./bookingEmail";

const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const BOOKING_EMAIL = defineString("BOOKING_EMAIL", { default: "contacto.nayra.lancheros@gmail.com" });
const PANEL_URL = defineString("PANEL_URL", { default: "https://nayra-web--nayra-lancheros.us-east4.hosted.app/panel" });

/**
 * Emails the manager when the contact form saves a request. Runs as a trigger (not inside the
 * Server Action) so a Gmail hiccup never loses the request: it is already saved and visible in
 * the panel, and the function retries. In the emulator, without the secret, it only logs.
 */
export const onBookingRequest = onDocumentCreated(
  { document: "bookingRequests/{id}", region: "us-east4", secrets: [GMAIL_APP_PASSWORD], retry: true, timeoutSeconds: 60 },
  async (event) => {
    const data = event.data?.data() as BookingRequestDoc | undefined;
    if (!data) return;
    const mail = buildBookingEmail(data, PANEL_URL.value());
    let password = "";
    try {
      password = GMAIL_APP_PASSWORD.value().replace(/\s+/g, "");
    } catch {
      password = "";
    }
    if (!password) {
      logger.info("GMAIL_APP_PASSWORD not set: email not sent", { subject: mail.subject });
      return;
    }
    const from = BOOKING_EMAIL.value();
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user: from, pass: password } });
    await transport.sendMail({ from: `Sitio Nayra Lancheros <${from}>`, to: from, replyTo: mail.replyTo, subject: mail.subject, text: mail.text });
    logger.info("booking email sent", { id: event.params.id });
  },
);
