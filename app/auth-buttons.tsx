"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { joinWaitlist } from "./actions";

const buttonClass =
  "h-12 rounded-full bg-foreground px-6 font-medium text-background transition-colors shadow-[0_0_20px_rgba(165,180,252,0.35)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60";

export function JoinWithGoogleButton({ disabled = false }) {
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
    <div className="flex w-full flex-col items-stretch gap-3 text-center">
      <button
        type="button"
        onClick={signIn}
        disabled={disabled || pending}
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

// Sign-up without login: name + email go straight into the waitlist.
export function SignUpForm({ disabled = false }) {
  const [state, formAction, pending] = useActionState(joinWaitlist, {
    status: "idle",
  });

  if (state.status === "joined") {
    return <ThankYou />;
  }

  const inputClass =
    "h-12 rounded-full bg-white/10 px-5 text-white ring-1 ring-white/20 placeholder:text-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60";

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-3">
      <label htmlFor="name" className="sr-only">
        Your name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        maxLength={100}
        autoComplete="name"
        placeholder="Your name"
        disabled={disabled || pending}
        className={inputClass}
      />
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        maxLength={254}
        autoComplete="email"
        placeholder="you@example.com"
        disabled={disabled || pending}
        className={inputClass}
      />
      <button
        type="submit"
        disabled={disabled || pending}
        className={buttonClass}
      >
        {pending ? "Joining…" : "Join the waitlist"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-rose-300">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function ThankYou() {
  return (
    <div role="status" className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold text-white">Thank you.</h2>
      <p className="text-lg text-indigo-100">
        We will inform about Podcast later.
      </p>
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
