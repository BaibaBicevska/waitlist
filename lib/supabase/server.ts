import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// False when the env vars are missing, e.g. forgotten on the hosting service.
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

// Supabase client for Server Components, Server Actions and Route Handlers.
// It reads the login session from cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies. Safe to ignore once the
            // proxy refreshes sessions (Milestone 4).
          }
        },
      },
    },
  );
}
