import type { BookingRepositories } from "@/domain/repositories";
import { MAX_REQUESTS_PER_HOUR, bookingRequestFrom, promoterFromBooking, type BookingInput } from "@/domain/rules/booking";

export type SubmitResult = "ok" | "rate_limited";

/** A web request: rate limit by (hashed) sender, then request + prospect in one transaction. */
export async function submitBooking(repos: BookingRepositories, input: BookingInput, senderKey: string, now: Date): Promise<SubmitResult> {
  if ((await repos.hitRateLimit(senderKey, now)) > MAX_REQUESTS_PER_HOUR) return "rate_limited";
  await repos.createBookingRequest(bookingRequestFrom(input, now), promoterFromBooking(input, now));
  return "ok";
}
