import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function POST(request: NextRequest) {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email and password" },
      { status: 400 },
    );

  const response = NextResponse.json({ ok: true, route: "/dashboard" });
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(items: CookieToSet[]) {
          items.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const { data, error } = await db.auth.signInWithPassword(parsed.data);
  if (error || !data.user)
    return NextResponse.json(
      { error: error?.message || "Invalid login credentials" },
      { status: 401 },
    );

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("role,status")
    .eq("id", data.user.id)
    .single();
  if (profileError || !profile) {
    await db.auth.signOut();
    return NextResponse.json(
      {
        error:
          "Your account profile could not be loaded. Please contact BGSB support.",
      },
      { status: 403 },
    );
  }
  if (profile.status !== "active") {
    await db.auth.signOut();
    return NextResponse.json(
      { error: "This account is not active. Please contact BGSB support." },
      { status: 403 },
    );
  }
  const route = `/dashboard/${profile.role.replace("_", "-")}`;
  const admin = createAdminClient();
  const { data: currentTerms } = await admin
    .from("legal_terms")
    .select("id,version")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextRoute = route;
  if (currentTerms) {
    const { data: acceptance } = await admin
      .from("terms_acceptances")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("terms_version", currentTerms.version)
      .maybeSingle();
    if (!acceptance)
      nextRoute = `/terms-acceptance?returnTo=${encodeURIComponent(route)}`;
  }
  const body = NextResponse.json({ ok: true, route: nextRoute });
  response.cookies.getAll().forEach((cookie) => body.cookies.set(cookie));
  return body;
}
