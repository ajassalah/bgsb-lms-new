function isLocalUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

export function getSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
    /\/$/,
    "",
  );
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const requestOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin;

  // Local development keeps its configured localhost URL. In production, a
  // stale localhost setting must never be included in account emails.
  if (configured && !(isLocalUrl(configured) && !isLocalUrl(requestOrigin))) {
    return configured;
  }

  return requestOrigin.replace(/\/$/, "");
}
