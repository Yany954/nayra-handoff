"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/infrastructure/auth/session";

export async function signOut() {
  await destroySession();
  redirect("/panel/login");
}
