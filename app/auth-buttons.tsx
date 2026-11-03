"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const buttonClass =
  "h-12 rounded-full bg-foreground px-6 font-medium text-background transition-colors shadow-[0_0_20px_rgba(165,180,252,0.35)] hover:bg-white";

export function JoinWithGoogleButton() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button type="button" onClick={signIn} className={buttonClass}>
      Join with Google
    </button>
  );
}

export function LogOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className={buttonClass}>
      Log out
    </button>
  );
}
