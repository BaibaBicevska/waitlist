import { connection } from "next/server";

// Visit /api/supabase-check to test the URL and key in .env.local.
export async function GET() {
  await connection(); // run on every request, never prerender at build

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || url.includes("YOUR-PROJECT-REF")) {
    return Response.json(
      { ok: false, error: "Fill in .env.local, then restart `npm run dev`." },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
    });
    if (!res.ok) {
      return Response.json(
        { ok: false, error: `Supabase answered ${res.status}. Check the key.` },
        { status: 502 },
      );
    }
    return Response.json({ ok: true, message: "Connected to Supabase 🎉" });
  } catch {
    return Response.json(
      { ok: false, error: "Could not reach Supabase. Check the URL." },
      { status: 502 },
    );
  }
}
