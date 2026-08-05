"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Search } from "lucide-react";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
type Value = {
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  phone_country_code: string | null;
  address: string | null;
  avatar_url: string | null;
};
const flag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (character) =>
      String.fromCodePoint(127397 + character.charCodeAt(0)),
    );
export function AdminProfileForm({ value }: { value: Value }) {
  const initial =
      countries.find((x) => x.dial === value.phone_country_code) ||
      countries.find((x) => x.code === "LK")!,
    [country, setCountry] = useState(initial),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [preview, setPreview] = useState(value.avatar_url || ""),
    [busy, setBusy] = useState(false),
    router = useRouter(),
    visible = useMemo(
      () =>
        countries.filter((x) =>
          `${x.name} ${x.dial}`.toLowerCase().includes(query.toLowerCase()),
        ),
      [query],
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    form.set("phone_country_code", country.dial);
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      body: form,
    });
    if (res.ok) {
      toast.success("Profile updated");
      router.refresh();
    } else {
      toast.error(
        (await res.json().catch(() => ({}))).error || "Update failed",
      );
      setBusy(false);
    }
  }
  return (
    <>
      <p className="text-sm text-slate-400">Account / Manage Profile</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Manage Profile</h1>
      <form
        onSubmit={submit}
        className="mt-7 rounded-xl border bg-white p-4 sm:p-7"
      >
        <label className="relative mx-auto block size-36 cursor-pointer">
          <span className="grid size-full place-items-center overflow-hidden rounded-full bg-navy text-4xl font-bold text-white">
            {preview ? (
              <img src={preview} className="size-full object-cover" alt="" />
            ) : (
              value.first_name?.[0] || "A"
            )}
          </span>
          <span className="absolute bottom-1 right-1 grid size-10 place-items-center rounded-full bg-red text-white">
            <Camera className="size-4" />
          </span>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field
            label="First Name"
            name="first_name"
            value={value.first_name}
          />
          <Field label="Last Name" name="last_name" value={value.last_name} />
          <label className="text-sm font-semibold">
            Email Address
            <input
              value={value.email}
              disabled
              className="field mt-2 bg-slate-100 text-slate-400"
            />
          </label>
          <div className="relative">
            <label className="text-sm font-semibold">Phone Number</label>
            <div className="mt-2 flex">
              <button
                type="button"
                onClick={() => setOpen((x) => !x)}
                className="rounded-l-xl border border-r-0 px-3 text-sm"
              >
                {flag(country.code)} {country.dial}
              </button>
              <input
                name="phone"
                defaultValue={value.phone?.replace(
                  value.phone_country_code || "",
                  "",
                )}
                className="field rounded-l-none"
                required
              />
            </div>
            {open && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white p-2 shadow-xl">
                <label className="flex items-center gap-2 rounded-lg border px-3">
                  <Search className="size-4" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full outline-none"
                    placeholder="Search country..."
                  />
                </label>
                <div className="max-h-48 overflow-y-auto">
                  {visible.map((x) => (
                    <button
                      type="button"
                      key={x.code}
                      onClick={() => {
                        setCountry(x);
                        setOpen(false);
                      }}
                      className="flex w-full justify-between rounded-lg p-2 text-sm hover:bg-slate-50"
                    >
                      <span>
                        {flag(x.code)} {x.name}
                      </span>
                      <span>{x.dial}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <label className="text-sm font-semibold md:col-span-2">
            Address
            <textarea
              name="address"
              defaultValue={value.address || ""}
              className="field mt-2 min-h-24"
              required
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </>
  );
}
function Field({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string | null;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        name={name}
        defaultValue={value || ""}
        className="field mt-2"
        required
      />
    </label>
  );
}
