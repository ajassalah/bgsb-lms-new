import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  const { data } = await db
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();
  if (data?.avatar_url)
    return Response.redirect(new URL(data.avatar_url, request.url), 307);

  const initial = (user.email?.trim()[0] || "U").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#111827"/><text x="40" y="50" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="700" fill="white">${initial}</text></svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=60",
    },
  });
}
