import Image from "next/image";
import { Suspense } from "react";
import { SleepyBackground } from "./sleepy-background";
import { createClient } from "@/lib/supabase/server";
import { JoinWithGoogleButton, LogOutButton } from "./auth-buttons";

// Reads the login cookie, so it renders per request inside <Suspense>.
async function AuthArea() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <JoinWithGoogleButton />;
  }

  // RLS only lets a user read their own row, so this returns 0 or 1 rows.
  const { data: entry } = await supabase
    .from("waitlist")
    .select("created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const meta = user.user_metadata;
  const firstName = (meta.full_name ?? user.email ?? "").split(" ")[0];

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
          <div role="status" className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold text-white">Thank you.</h2>
            <p className="text-lg text-indigo-100">
              You are in the waitlist. Your Podcast will reach you soon...
            </p>
          </div>
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

export default function Home() {
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
        <AuthArea />
      </Suspense>
    </main>
  );
}
