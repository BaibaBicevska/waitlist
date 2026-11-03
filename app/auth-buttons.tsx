"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const buttonClass =
  "h-12 rounded-full bg-foreground px-6 font-medium text-background transition-colors shadow-[0_0_20px_rgba(165,180,252,0.35)] hover:bg-white disabled:cursor-wait disabled:opacity-60";

export function JoinWithGoogleButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser is already leaving for Google.
    if (error) {
      setError(error.message);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className={buttonClass}
      >
        {pending ? "Opening Google…" : "Join with Google"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function LogOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className={buttonClass}
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
