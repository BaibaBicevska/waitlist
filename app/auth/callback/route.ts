import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google → Supabase → here, with a one-time `code` in the URL.
// We swap the code for a session (stored in cookies) and go back home.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { user } = data;

      // Save to the waitlist. Logging in again hits the unique user_id and
      // is ignored (ON CONFLICT DO NOTHING), so there is never a second row.
      const { error: saveError } = await supabase.from("waitlist").upsert(
        {
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name ?? null,
        },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
      if (saveError) {
        console.error("Could not save to waitlist:", saveError.message);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=login_failed`);
}
