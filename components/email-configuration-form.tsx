"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
export function EmailConfigurationForm({ value }: { value: any }) {
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget)),
      res = await fetch("/api/admin/email-configuration", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    setBusy(false);
    res.ok
      ? toast.success("Email configuration saved")
      : toast.error((await res.json()).error || "Save failed");
  }
  return (
    <>
      <p className="text-sm text-slate-400">System Settings</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Email Configuration</h1>
      <form
        onSubmit={submit}
        className="mt-7 grid gap-5 rounded-2xl border bg-white p-5 sm:grid-cols-2 sm:p-7"
      >
        {[
          ["SMTP Host", "smtp_host", "smtp.example.com"],
          ["SMTP Port", "smtp_port", "587"],
          ["SMTP Username", "smtp_username", "Username"],
          ["SMTP Password", "smtp_password", "Password"],
          ["From Name", "from_name", "BGSB Learning"],
          ["From Email", "from_email", "mail@example.com"],
        ].map(([label, name, placeholder]) => (
          <label key={name} className="text-sm font-semibold text-navy">
            {label}
            <input
              name={name}
              type={
                name === "smtp_password"
                  ? "password"
                  : name === "smtp_port"
                    ? "number"
                    : "text"
              }
              defaultValue={value?.[name] || ""}
              placeholder={placeholder}
              className="field mt-2"
              required={!["smtp_username", "smtp_password"].includes(name)}
            />
          </label>
        ))}
        <label className="text-sm font-semibold text-navy">
          Encryption
          <select
            name="encryption"
            defaultValue={value?.encryption || "tls"}
            className="field mt-2"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </label>
        <div className="flex items-end sm:justify-end">
          <button disabled={busy} className="btn-primary gap-2">
            <Save className="size-4" />
            {busy ? "Saving…" : "Save Configuration"}
          </button>
        </div>
      </form>
    </>
  );
}
