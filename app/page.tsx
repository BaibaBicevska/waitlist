import Image from "next/image";
import { Suspense } from "react";
import { SleepyBackground } from "./sleepy-background";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import {
  JoinWithGoogleButton,
  LogOutButton,
  SignUpForm,
  ThankYou,
} from "./auth-buttons";

function SignInOptions({ disabled = false }) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <JoinWithGoogleButton disabled={disabled} />
      <div className="flex w-full items-center gap-3 text-sm text-indigo-300">
        <span className="h-px flex-1 bg-white/20" />
        or
        <span className="h-px flex-1 bg-white/20" />
      </div>
      <SignUpForm disabled={disabled} />
    </div>
  );
}

// Reads the login cookie, so it renders per request inside <Suspense>.
async function AuthArea({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  if (!supabaseConfigured) {
    // For the developer: visible in the terminal / hosting logs, not to visitors.
    console.error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then rebuild.",
    );
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <SignInOptions disabled />
        <p className="text-sm text-indigo-300">
          Sign-ups open very soon. Check back shortly!
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { error } = await searchParams;
    return (
      <div className="flex w-full flex-col items-center gap-3">
        {error && (
          <p role="alert" className="text-rose-300">
            Login didn&apos;t work. Please try again.
          </p>
        )}
        <SignInOptions />
      </div>
    );
  }

  // No filter needed: RLS only returns this user's own row, matched by
  // user_id (Google) or by their verified email (signed up via the form).
  const { data: entries } = await supabase
    .from("waitlist")
    .select("id")
    .limit(1);
  const entry = entries?.[0];

  const meta = user.user_metadata;
  const firstName = (meta.full_name || user.email || "").split(" ")[0];

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 shadow-lg ring-1 ring-white/15 backdrop-blur-md">
        {meta.avatar_url && (
          <Image
            src={meta.avatar_url}
            alt={meta.full_name ?? "Profile picture"}
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        {entry ? (
          <ThankYou />
        ) : (
          <h2 className="text-2xl font-semibold text-rose-300">
            Logged in, but not saved to the waitlist yet.
          </h2>
        )}
        <p className="text-indigo-200">
          {firstName} · {user.email}
        </p>
        <LogOutButton />
      </div>

      <details className="w-full text-left">
        <summary className="cursor-pointer text-sm text-indigo-300">
          Everything Google told us about you
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-4 text-xs text-indigo-100 backdrop-blur-md">
          {JSON.stringify(
            { user_metadata: meta, identities: user.identities },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center font-sans">
      <SleepyBackground />
      <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_25px_rgba(165,180,252,0.6)]">
        SnoozeCast
      </h1>
      <p className="max-w-md text-lg text-indigo-200">
        Podcasts that get quieter as you fall asleep.
      </p>
      <Suspense fallback={<div className="h-12" />}>
        <AuthArea searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
