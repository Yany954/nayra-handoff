import type { ContentRepositories } from "@/domain/repositories";
import { createSeedRepositories } from "@/infrastructure/repositories/seed";

/** Composition root: Phase 3 swaps this line for the Firestore implementation. */
export const repositories: ContentRepositories = createSeedRepositories();
