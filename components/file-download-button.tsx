"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function responseFileName(header: string | null, fallback: string) {
  if (!header) return fallback;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  return header.match(/filename="([^"]+)"/i)?.[1] || fallback;
}

export function FileDownloadButton({
  href,
  label = "Download",
  fallbackName = "download",
  className = "btn-secondary gap-2",
}: {
  href: string;
  label?: string;
  fallbackName?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const response = await fetch(href, { credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Download failed");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = responseFileName(
        response.headers.get("content-disposition"),
        fallbackName,
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className={className}
    >
      <Download className="size-4" />
      {busy ? "Downloading..." : label}
    </button>
  );
}
