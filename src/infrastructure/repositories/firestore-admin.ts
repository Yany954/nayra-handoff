import "server-only";
import { randomUUID } from "node:crypto";
import type { Firestore, QuerySnapshot } from "firebase-admin/firestore";
import { z } from "zod";
import type { AdminRepositories, AdminSong, NewGalleryPhoto, ShowInput } from "@/domain/repositories";
import type { bucket as storageBucket } from "@/infrastructure/firebase/admin";
import { createFirestoreRepositories } from "@/infrastructure/repositories/firestore";
import {
  achievementSchema,
  epkSchema,
  galleryDocSchema,
  publicSongSchema,
  videoSchema,
} from "@/infrastructure/schemas/content";
import {
  bookingRequestSchema,
  discoveredEventSchema,
  pitchSchema,
  promoterSchema,
} from "@/infrastructure/schemas/panel";

const EXTENSIONS: Record<NewGalleryPhoto["contentType"], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function parseAll<T>(schema: z.ZodType<T, unknown>, snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map((doc) => schema.parse({ ...doc.data(), id: doc.id }));
}

/** Firestore rejects `undefined`, and a full `set` should drop cleared optional fields. */
function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Uncached on purpose: private data must never enter the shared `"use cache"` store. */
type Bucket = ReturnType<typeof storageBucket>;

export function createAdminRepositories(db: Firestore, bucket: Bucket): AdminRepositories {
  const content = createFirestoreRepositories(db);
  const gallery = db.collection("gallery");

  /** Create with an auto id, or replace an existing document (cleared optional fields disappear). */
  async function saveDoc(name: string, id: string | null, data: object) {
    const clean = withoutUndefined(data);
    if (id) await db.collection(name).doc(id).set(clean);
    else await db.collection(name).add(clean);
  }

  async function galleryDocs() {
    return parseAll(galleryDocSchema, await gallery.orderBy("order").get());
  }

  return {
    listPromoters: async () => parseAll(promoterSchema, await db.collection("promoters").get()),
    listBookingRequests: async () => parseAll(bookingRequestSchema, await db.collection("bookingRequests").get()),
    listDiscoveredEvents: async () =>
      parseAll(discoveredEventSchema, await db.collection("discoveredEvents").where("status", "==", "pending").get()),

    listShows: () => content.listShows(),
    createShow: async (input: ShowInput) => (await db.collection("shows").add(withoutUndefined(input))).id,
    updateShow: async (id, input) => {
      await db.collection("shows").doc(id).set(withoutUndefined(input));
    },
    deleteShow: async (id) => {
      await db.collection("shows").doc(id).delete();
    },

    listGallery: () => content.listGallery(),
    addGalleryPhoto: async ({ bytes, contentType, alt }) => {
      const id = `${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
      const storagePath = `public/gallery/${id}.${EXTENSIONS[contentType]}`;
      await bucket.file(storagePath).save(Buffer.from(bytes), {
        contentType,
        resumable: false,
        metadata: { cacheControl: "public, max-age=31536000, immutable" },
      });
      // Newest first: a fresh photo shows up in the home preview right away.
      const docs = await galleryDocs();
      const order = (docs[0]?.order ?? 1) - 1;
      await gallery.doc(id).set(galleryDocSchema.omit({ id: true }).parse({ alt, order, storagePath }));
      return id;
    },
    updateGalleryAlt: async (id, alt) => {
      await gallery.doc(id).update({ alt });
    },
    deleteGalleryPhoto: async (id) => {
      const snapshot = await gallery.doc(id).get();
      if (!snapshot.exists) return;
      const { storagePath } = galleryDocSchema.parse({ ...snapshot.data(), id });
      await gallery.doc(id).delete();
      await bucket.file(storagePath).delete({ ignoreNotFound: true });
    },
    reorderGallery: async (ids) => {
      const current = (await galleryDocs()).map((d) => d.id);
      const known = new Set(current);
      const ordered = [...ids.filter((id) => known.has(id)), ...current.filter((id) => !ids.includes(id))];
      const batch = db.batch();
      ordered.forEach((id, index) => batch.update(gallery.doc(id), { order: index + 1 }));
      await batch.commit();
    },

    getPromoter: async (id) => {
      const snapshot = await db.collection("promoters").doc(id).get();
      return snapshot.exists ? promoterSchema.parse({ ...snapshot.data(), id }) : null;
    },
    createPromoter: async (promoter) => (await db.collection("promoters").add(promoter)).id,
    updatePromoter: async ({ id, ...promoter }) => {
      await db.collection("promoters").doc(id).set(promoter);
    },
    deletePromoter: async (id) => {
      await db.collection("promoters").doc(id).delete();
    },

    listAchievements: () => content.listAchievements(),
    saveAchievement: (id, input) => saveDoc("achievements", id, achievementSchema.omit({ id: true }).parse(input)),
    deleteAchievement: async (id) => {
      await db.collection("achievements").doc(id).delete();
    },

    listVideos: () => content.listVideos(),
    saveVideo: (id, input) => saveDoc("videos", id, videoSchema.omit({ id: true }).parse(input)),
    deleteVideo: async (id) => {
      await db.collection("videos").doc(id).delete();
    },

    listFormats: () => content.listFormats(),
    saveFormat: (id, input) => saveDoc("formats", id, input),
    deleteFormat: async (id) => {
      await db.collection("formats").doc(id).delete();
    },

    listSongs: async () => {
      const songs = await content.listSongs();
      if (songs.length === 0) return [];
      const metas = await db.getAll(...songs.map((s) => db.doc(`songs/${s.id}/private/meta`)));
      return songs.map((song, i): AdminSong => {
        const key = metas[i]?.get("key");
        return { ...song, key: typeof key === "string" && key ? key : null };
      });
    },
    // The public document and the private key are written together; the key never lands in songs/{id}.
    saveSong: async (id, { key, ...song }) => {
      const ref = id ? db.collection("songs").doc(id) : db.collection("songs").doc();
      const batch = db.batch();
      batch.set(ref, publicSongSchema.omit({ id: true }).parse(song));
      if (key) batch.set(ref.collection("private").doc("meta"), { key });
      else batch.delete(ref.collection("private").doc("meta"));
      await batch.commit();
    },
    deleteSong: async (id) => {
      await db.recursiveDelete(db.collection("songs").doc(id));
    },

    getPitch: async () => {
      const snapshot = await db.doc("pitch/main").get();
      if (!snapshot.exists) throw new Error("Missing document pitch/main. Run `npm run seed`.");
      return pitchSchema.parse(snapshot.data());
    },
    savePitch: async (templates) => {
      await db.doc("pitch/main").set(pitchSchema.parse(templates));
    },

    getEpk: () => content.getEpk(),
    getProfile: () => content.getProfile(),
    saveEpk: async (epk, profile) => {
      const batch = db.batch();
      batch.set(db.doc("epk/main"), epkSchema.parse(epk));
      batch.update(db.doc("profile/main"), profile);
      await batch.commit();
    },
  };
}
