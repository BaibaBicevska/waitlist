"use server";

import { createClient } from "@/lib/supabase/server";

export type JoinState = { status: "idle" | "joined" | "error"; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign-up form: stores name + email in the waitlist, no login needed.
// Runs on the server, so the checks below can't be skipped by the browser.
export async function joinWaitlist(
  _previous: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || name.length > 100) {
    return { status: "error", message: "Please enter your name." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ source: "form", email, full_name: name });

  // 23505 = unique violation: this email is already on the list. Show the
  // same thank-you, so the form doesn't reveal who has signed up.
  if (error && error.code !== "23505") {
    console.error("Could not save to waitlist:", error.message);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  return { status: "joined" };
}
