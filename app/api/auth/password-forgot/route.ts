import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPasswordResetLink } from "@/lib/email";

// Best-effort throttle per instance: one request per email every 60 seconds.
const recent = new Map<string, number>();

export async function POST(request: NextRequest) {
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  const { email } = parsed.data;
  const now = Date.now();
  const last = recent.get(email);
  if (last && now - last < 60_000)
    return NextResponse.json(
      { error: "A reset link was just requested. Please wait a minute and try again." },
      { status: 429 },
    );
  recent.set(email, now);
  if (recent.size > 5000) recent.clear();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  try {
    await sendPasswordResetLink({ email, siteUrl });
  } catch (error) {
    console.error("[password-forgot] could not send reset email", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "We couldn't send the email right now. Please try again later or contact BGSB support." },
      { status: 500 },
    );
  }
  // Same response whether or not the account exists.
  return NextResponse.json({ ok: true });
}
