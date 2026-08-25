"use client";
import { useMemo, useState } from "react";
import { Save, Search, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
export type StudentFormValue = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  country: string | null;
  about: string | null;
  nic_passport: string | null;
  phone_country_code: string | null;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  whatsapp_number: string | null;
};
export function StudentForm({ student }: { student?: StudentFormValue }) {
  const initialCountry =
    countries.find((x) => x.name === student?.country) || null;
  const [countryQuery, setCountryQuery] = useState(""),
    [country, setCountry] = useState<(typeof countries)[number] | null>(
      initialCountry,
    ),
    [countryOpen, setCountryOpen] = useState(false),
    [image, setImage] = useState(student?.avatar_url || ""),
    [removeAvatar, setRemoveAvatar] = useState(false),
    [whatsappMode, setWhatsappMode] = useState(
      student?.whatsapp_number && student.whatsapp_number !== student.phone
        ? "new"
        : "same",
    ),
    [busy, setBusy] = useState(false),
    router = useRouter(),
    visible = useMemo(
      () =>
        countries.filter((x) =>
          x.name.toLowerCase().includes(countryQuery.toLowerCase()),
        ),
      [countryQuery],
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!country) return toast.error("Select a country");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    form.set("country", country.name);
    form.set("phone_country_code", country.dial);
    form.set("remove_avatar", removeAvatar ? "true" : "false");
    const res = await fetch(
      student ? `/api/admin/students/${student.id}` : "/api/admin/students",
      {
        method: student ? "PATCH" : "POST",
        body: form,
      },
    );
    if (res.ok) {
      toast.success(
        student ? "Student updated" : "Student created and invitation sent",
      );
      router.push("/dashboard/super-admin/students");
      router.refresh();
    } else {
      toast.error(
        (await res.json().catch(() => ({}))).error || "Student creation failed",
      );
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="text-sm text-slate-400">
          Manage Students / {student ? "Edit" : "Add"} Student
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy">
          {student ? "Edit" : "Add"} Student
        </h1>
      </div>
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-bold text-navy">Personal Information</h2>
        <div className="mt-6 flex flex-col items-center">
          <label className="relative grid size-40 cursor-pointer place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg ring-2 ring-dashed ring-slate-300">
            {image ? (
              <img
                src={image}
                alt="Student profile preview"
                className="size-full object-cover"
              />
            ) : (
              <span className="text-center">
                <Upload className="mx-auto mb-2 text-red" />
                <b className="text-xs text-navy">Upload Image</b>
              </span>
            )}
            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(URL.createObjectURL(file));
                  setRemoveAvatar(false);
                }
              }}
            />
          </label>
          {image && (
            <button
              type="button"
              onClick={() => {
                setImage("");
                setRemoveAvatar(true);
              }}
              className="mt-3 flex items-center gap-2 rounded-lg border border-red/20 px-3 py-2 text-xs font-semibold text-red"
            >
              <Trash2 className="size-4" />
              Remove Image
            </button>
          )}
          <b className="mt-3 text-sm text-navy">Upload Profile Image</b>
          <small className="text-slate-400">JPG, PNG or WebP</small>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="First Name"
            name="first_name"
            defaultValue={student?.first_name || ""}
          />
          <Field
            label="Last Name"
            name="last_name"
            defaultValue={student?.last_name || ""}
          />
          <Field
            label="Address"
            name="address"
            defaultValue={student?.address || ""}
          />
          <Field
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            defaultValue={student?.date_of_birth || ""}
          />
          <label className="text-sm font-semibold">
            Gender
            <select
              name="gender"
              defaultValue={student?.gender || ""}
              className="field mt-2"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
          <div className="relative">
            <label className="text-sm font-semibold">Country</label>
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="field mt-2 text-left"
            >
              {country ? `${country.name} (${country.dial})` : "Select country"}
            </button>
            {countryOpen && (
              <div className="absolute z-40 mt-1 w-full rounded-xl border bg-white p-2 shadow-xl">
                <label className="relative block">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="field py-2 pl-10"
                    placeholder="Search country..."
                  />
                </label>
                <div className="mt-2 max-h-56 overflow-y-auto">
                  {visible.map((x) => (
                    <button
                      type="button"
                      key={x.code}
                      onClick={() => {
                        setCountry(x);
                        setCountryOpen(false);
                      }}
                      className="flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span>{x.name}</span>
                      <b>{x.dial}</b>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          About <span className="font-normal text-slate-400">(Optional)</span>
          <textarea
            name="about"
            defaultValue={student?.about || ""}
            className="field mt-2 min-h-28"
          />
        </label>
      </section>
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-bold text-navy">Identification</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="NIC/Passport No (Optional)"
            name="nic_passport"
            defaultValue={student?.nic_passport || ""}
            required={false}
          />
          <label className="text-sm font-semibold">
            Phone Number
            <div className="mt-2 flex">
              <span className="grid min-w-16 place-items-center rounded-l-lg border border-r-0 bg-slate-50 px-3 text-sm font-bold text-navy">
                {country?.dial || "+"}
              </span>
              <input
                name="phone"
                type="tel"
                className="field rounded-l-none"
                required
                placeholder="Phone number"
                defaultValue={
                  student?.phone?.replace(
                    student.phone_country_code || "",
                    "",
                  ) || ""
                }
              />
            </div>
          </label>
          <Field
            label="Email Address"
            name="email"
            type="email"
            defaultValue={student?.email || ""}
          />
          <label className="text-sm font-semibold">
            WhatsApp Number{" "}
            <span className="font-normal text-slate-400">(Optional)</span>
            <select
              name="whatsapp_mode"
              value={whatsappMode}
              onChange={(e) => setWhatsappMode(e.target.value)}
              className="field mt-2"
            >
              <option value="same">Same as Phone Number</option>
              <option value="new">New</option>
            </select>
            {whatsappMode === "new" && (
              <input
                name="whatsapp_number"
                type="tel"
                defaultValue={student?.whatsapp_number || ""}
                className="field mt-2"
                placeholder="WhatsApp number with country code"
              />
            )}
          </label>
        </div>
      </section>
      <div className="flex justify-end">
        <button disabled={busy} className="btn-primary gap-2">
          <Save className="size-4" />
          {busy ? "Saving…" : student ? "Save Changes" : "Create Student"}
        </button>
      </div>
    </form>
  );
}
function Field({
  label,
  required = true,
  ...props
}: {
  label: string;
  name: string;
  required?: boolean;
  [key: string]: any;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input {...props} className="field mt-2" required={required} />
    </label>
  );
}
