import { cacheLife, cacheTag } from "next/cache";
import type { AdminRepositories, ContentRepositories } from "@/domain/repositories";
import { bucket, db } from "@/infrastructure/firebase/admin";
import { createFirestoreRepositories } from "@/infrastructure/repositories/firestore";
import { createAdminRepositories } from "@/infrastructure/repositories/firestore-admin";

/**
 * Tag shared by every cached content read. Panel Server Actions (phase 4) call
 * `updateTag(CONTENT_TAG)` after a write so the public site shows it on the next load.
 */
export const CONTENT_TAG = "content";

const firestore = () => createFirestoreRepositories(db());

// Each read is cached across requests; module-level functions keep the cache key to the arguments.
async function getProfile() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().getProfile();
}
async function getEpk() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().getEpk();
}
async function listAchievements() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().listAchievements();
}
async function listShows() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().listShows();
}
async function listSongs() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().listSongs();
}
async function listFormats() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().listFormats();
}
async function listVideos() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().listVideos();
}
async function listGallery() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return firestore().listGallery();
}

/** Composition root: the only place that decides where content comes from. */
export const repositories: ContentRepositories = {
  getProfile,
  getEpk,
  listAchievements,
  listShows,
  listSongs,
  listFormats,
  listVideos,
  listGallery,
};

/** Manager-only data, uncached. Call only after `requireAdmin()`. */
export function adminRepositories(): AdminRepositories {
  return createAdminRepositories(db(), bucket());
}
