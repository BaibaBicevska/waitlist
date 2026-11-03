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

      // Save to the waitlist. If this user or email is already there (logged
      // in before, or signed up with the form), the unique constraints reject
      // the insert with 23505, which is fine: there is never a second row.
      const { error: saveError } = await supabase.from("waitlist").insert({
        user_id: user.id,
        email: user.email?.toLowerCase(),
        full_name: user.user_metadata.full_name ?? null,
      });
      if (saveError && saveError.code !== "23505") {
        console.error("Could not save to waitlist:", saveError.message);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=login_failed`);
}
