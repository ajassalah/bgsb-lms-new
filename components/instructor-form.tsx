"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Save, Search, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import { type PermissionSet } from "./permission-matrix";
import { RoleCombobox } from "./role-combobox";
type Org = { id: string; name: string };
type Education = {
  education: string;
  field_of_study: string;
  college: string;
  university: string;
  graduation_year: string;
};
type Professional = {
  company: string;
  designation: string;
  years_experience: string;
  note: string;
};
export type InstructorValue = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_country_code: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string;
  organization_id: string | null;
  designation: string | null;
  website: string | null;
  expertises: string[] | null;
  address: string | null;
  country: string | null;
  about: string | null;
  nic_passport: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  education_background: Education[] | null;
  professional_details: Professional[] | null;
  resume_url: string | null;
  staff_role?: string | null;
};
const flag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
export function InstructorForm({
  organizations,
  instructor,
  entity = "Instructor",
  basePath = "/dashboard/super-admin/instructors",
  profileRole = "instructor",
  initialPermissions = {},
}: {
  organizations: Org[];
  instructor?: InstructorValue;
  entity?: "Instructor" | "Staff";
  basePath?: string;
  profileRole?: "instructor" | "admin_staff";
  initialPermissions?: PermissionSet;
}) {
  const initialCountry =
      countries.find((x) => x.name === instructor?.country) || null,
    initialPhone =
      countries.find((x) => x.dial === instructor?.phone_country_code) ||
      initialCountry;
  const [country, setCountry] = useState(initialCountry),
    [phoneCountry, setPhoneCountry] = useState(initialPhone),
    [phoneCountryOpen, setPhoneCountryOpen] = useState(false),
    [phoneCountryQuery, setPhoneCountryQuery] = useState(""),
    [countryOpen, setCountryOpen] = useState(false),
    [countryQuery, setCountryQuery] = useState(""),
    [image, setImage] = useState(instructor?.avatar_url || ""),
    [removeAvatar, setRemoveAvatar] = useState(false),
    [whatsappMode, setWhatsappMode] = useState(
      instructor?.whatsapp_number &&
        instructor.whatsapp_number !== instructor.phone
        ? "new"
        : "same",
    ),
    [education, setEducation] = useState<Education[]>(
      instructor?.education_background || [],
    ),
    [professional, setProfessional] = useState<Professional[]>(
      instructor?.professional_details || [],
    ),
    [resume, setResume] = useState(instructor?.resume_url || ""),
    [busy, setBusy] = useState(false),
    [staffTab, setStaffTab] = useState<"personal" | "permissions">("personal"),
    [staffRole, setStaffRole] = useState(instructor?.staff_role || ""),
    [availableRoles, setAvailableRoles] = useState<
      { name: string; permissions: PermissionSet }[]
    >([]),
    [permissions, setPermissions] = useState<PermissionSet>(initialPermissions),
    router = useRouter(),
    visible = useMemo(
      () =>
        countries.filter((x) =>
          x.name.toLowerCase().includes(countryQuery.toLowerCase()),
        ),
      [countryQuery],
    ),
    visiblePhoneCountries = useMemo(
      () =>
        countries.filter((item) =>
          `${item.name} ${item.dial} ${item.code}`
            .toLowerCase()
            .includes(phoneCountryQuery.toLowerCase()),
        ),
      [phoneCountryQuery],
    );
  useEffect(() => {
    if (entity !== "Staff") return;
    fetch("/api/admin/staff-roles")
      .then((response) => response.json())
      .then((body) => setAvailableRoles(body.items || []))
      .catch(() => {});
  }, [entity]);
  function selectStaffRole(role: string) {
    setStaffRole(role);
    const preset = availableRoles.find((item) => item.name === role);
    if (preset) setPermissions(preset.permissions || {});
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!country || !phoneCountry)
      return toast.error("Select country and phone country code");
    if (entity === "Staff" && !staffRole) {
      setStaffTab("permissions");
      return toast.error("Select a staff role before creating the account");
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    form.set("country", country.name);
    form.set("phone_country_code", phoneCountry.dial);
    form.set("remove_avatar", removeAvatar ? "true" : "false");
    form.set("education_background", JSON.stringify(education));
    form.set("professional_details", JSON.stringify(professional));
    form.set("staff_role", staffRole);
    form.set("permissions", JSON.stringify(permissions));
    form.set("profile_role", profileRole);
    const res = await fetch(
      instructor
        ? `/api/admin/instructors/${instructor.id}?role=${profileRole}`
        : "/api/admin/instructors",
      { method: instructor ? "PATCH" : "POST", body: form },
    );
    if (res.ok) {
      const result = await res.json().catch(() => ({}));
      if (instructor) toast.success(`${entity} updated`);
      else
        toast.success(`${entity} created`, {
          description: result.email_warning
            ? `Account created, but email failed: ${result.email_warning}. Username: ${String(form.get("email"))} · Temporary password: ${result.temporary_password}`
            : `Login details were emailed to ${String(form.get("email"))}.`,
          duration: 15000,
        });
      router.push(basePath);
      router.refresh();
    } else {
      toast.error((await res.json().catch(() => ({}))).error || "Save failed");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="text-sm text-slate-400">
          {entity} / {instructor ? "Edit" : "Add"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy">
          {instructor ? "Edit" : "Add"} {entity}
        </h1>
      </div>
      {entity === "Staff" && (
        <div className="flex gap-2 rounded-xl border bg-white p-2">
          <button
            type="button"
            onClick={() => setStaffTab("personal")}
            className={`rounded-lg px-5 py-3 text-sm font-semibold ${staffTab === "personal" ? "bg-red text-white" : "text-slate-500"}`}
          >
            Personal Information
          </button>
          <button
            type="button"
            onClick={() => setStaffTab("permissions")}
            className={`rounded-lg px-5 py-3 text-sm font-semibold ${staffTab === "permissions" ? "bg-red text-white" : "text-slate-500"}`}
          >
            Permissions
          </button>
        </div>
      )}
      <div
        className={
          entity === "Staff" && staffTab !== "personal" ? "hidden" : "contents"
        }
      >
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Personal Information</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field
              label="First Name"
              name="first_name"
              value={instructor?.first_name}
            />
            <Field
              label="Last Name"
              name="last_name"
              value={instructor?.last_name}
            />
            <label className="text-sm font-semibold">
              Phone Number
              <div className="relative mt-2 flex">
                <button
                  type="button"
                  onClick={() => setPhoneCountryOpen((value) => !value)}
                  className="flex min-w-[112px] items-center justify-between gap-2 rounded-l-lg border border-r-0 bg-slate-50 px-3 text-sm"
                >
                  <span>
                    {phoneCountry
                      ? `${flag(phoneCountry.code)} ${phoneCountry.dial}`
                      : "Code"}
                  </span>
                  <ChevronDown className="size-4" />
                </button>
                {phoneCountryOpen && (
                  <div className="absolute left-0 top-12 z-[120] w-72 rounded-xl border bg-white p-2 shadow-2xl">
                    <label className="flex items-center gap-2 rounded-lg border px-3">
                      <Search className="size-4 text-slate-400" />
                      <input
                        autoFocus
                        value={phoneCountryQuery}
                        onChange={(event) =>
                          setPhoneCountryQuery(event.target.value)
                        }
                        className="h-10 min-w-0 flex-1 outline-none"
                        placeholder="Search country or code..."
                      />
                    </label>
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      {visiblePhoneCountries.map((item) => (
                        <button
                          type="button"
                          key={item.code}
                          onClick={() => {
                            setPhoneCountry(item);
                            setPhoneCountryOpen(false);
                            setPhoneCountryQuery("");
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span>
                            {flag(item.code)} {item.name}
                          </span>
                          <b>{item.dial}</b>
                        </button>
                      ))}
                      {!visiblePhoneCountries.length && (
                        <p className="p-4 text-center text-sm text-slate-400">
                          No countries found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <input
                  name="phone"
                  type="tel"
                  defaultValue={
                    instructor?.phone?.replace(
                      instructor.phone_country_code || "",
                      "",
                    ) || ""
                  }
                  className="field rounded-l-none"
                  required
                />
              </div>
            </label>
            <Field
              label="Email Address"
              name="email"
              type="email"
              value={instructor?.email}
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
                  defaultValue={instructor?.whatsapp_number || ""}
                  className="field mt-2"
                  placeholder="WhatsApp number with country code"
                />
              )}
            </label>
            <Field
              label="Designation"
              name="designation"
              value={instructor?.designation}
            />
            <Field
              label="Website (Optional)"
              name="website"
              type="url"
              value={instructor?.website}
              optional
            />
            <Field
              label="Expertises"
              name="expertises"
              value={(instructor?.expertises || []).join(", ")}
              placeholder="Business, Finance, Marketing"
            />
            <Field label="Address" name="address" value={instructor?.address} />
            <Field
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={instructor?.date_of_birth}
            />
            <label className="text-sm font-semibold">
              Gender
              <select
                name="gender"
                defaultValue={instructor?.gender || ""}
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
                {country
                  ? `${flag(country.code)} ${country.name}`
                  : "Select country"}
              </button>
              {countryOpen && (
                <div className="absolute z-40 mt-1 w-full rounded-xl border bg-white p-2 shadow-xl">
                  <label className="relative block">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <input
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      className="field pl-10"
                      placeholder="Search country..."
                    />
                  </label>
                  <div className="max-h-56 overflow-y-auto">
                    {visible.map((x) => (
                      <button
                        type="button"
                        key={x.code}
                        onClick={() => {
                          setCountry(x);
                          setCountryOpen(false);
                        }}
                        className="flex w-full gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span>{flag(x.code)}</span>
                        {x.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <label className="mt-5 block text-sm font-semibold">
            About
            <textarea
              name="about"
              defaultValue={instructor?.about || ""}
              className="field mt-2 min-h-32"
              required
            />
          </label>
          <div className="mt-6 flex flex-col items-center">
            <label className="relative grid size-40 cursor-pointer place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow ring-2 ring-dashed ring-slate-300">
              {image ? (
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-center">
                  <Upload className="mx-auto text-red" />
                  <b className="mt-2 block text-xs">Upload Profile Image</b>
                </span>
              )}
              <input
                name="avatar"
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImage(URL.createObjectURL(f));
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
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-red"
              >
                <Trash2 className="size-4" />
                Remove Image
              </button>
            )}
          </div>
        </section>
        <RepeatSection
          title="Education Background"
          addLabel="Add Education"
          add={() =>
            setEducation((x) => [
              ...x,
              {
                education: "",
                field_of_study: "",
                college: "",
                university: "",
                graduation_year: "",
              },
            ])
          }
        >
          {education.map((row, index) => (
            <div
              key={index}
              className="relative rounded-xl border bg-slate-50 p-5"
            >
              <button
                type="button"
                onClick={() =>
                  setEducation((x) => x.filter((_, i) => i !== index))
                }
                className="absolute right-3 top-3 text-red"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="grid gap-4 md:grid-cols-2">
                <Dynamic
                  label="Education"
                  value={row.education}
                  change={(v) =>
                    setEducation(update(education, index, "education", v))
                  }
                />
                <Dynamic
                  label="Field of Study"
                  value={row.field_of_study}
                  change={(v) =>
                    setEducation(update(education, index, "field_of_study", v))
                  }
                />
                <Dynamic
                  label="College"
                  value={row.college}
                  change={(v) =>
                    setEducation(update(education, index, "college", v))
                  }
                />
                <Dynamic
                  label="University"
                  value={row.university}
                  change={(v) =>
                    setEducation(update(education, index, "university", v))
                  }
                />
                <Dynamic
                  label="Graduation Year"
                  value={row.graduation_year}
                  change={(v) =>
                    setEducation(update(education, index, "graduation_year", v))
                  }
                  type="number"
                />
              </div>
            </div>
          ))}
        </RepeatSection>
        <RepeatSection
          title="Professional Details"
          addLabel="Add Professional Detail"
          add={() =>
            setProfessional((x) => [
              ...x,
              { company: "", designation: "", years_experience: "", note: "" },
            ])
          }
        >
          {professional.map((row, index) => (
            <div
              key={index}
              className="relative rounded-xl border bg-slate-50 p-5"
            >
              <button
                type="button"
                onClick={() =>
                  setProfessional((x) => x.filter((_, i) => i !== index))
                }
                className="absolute right-3 top-3 text-red"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="grid gap-4 md:grid-cols-2">
                <Dynamic
                  label="Company"
                  value={row.company}
                  change={(v) =>
                    setProfessional(update(professional, index, "company", v))
                  }
                />
                <Dynamic
                  label="Designation"
                  value={row.designation}
                  change={(v) =>
                    setProfessional(
                      update(professional, index, "designation", v),
                    )
                  }
                />
                <Dynamic
                  label="Years of Experience"
                  value={row.years_experience}
                  change={(v) =>
                    setProfessional(
                      update(professional, index, "years_experience", v),
                    )
                  }
                  type="number"
                />
                <Dynamic
                  label="Note"
                  value={row.note}
                  change={(v) =>
                    setProfessional(update(professional, index, "note", v))
                  }
                />
              </div>
            </div>
          ))}
        </RepeatSection>
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold text-navy">
            Professional Documents & Links
          </h2>
          <label className="mt-5 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 text-center">
            <Upload className="mb-3 size-8 text-red" />
            <b>Resume</b>
            <span className="mt-1 text-xs text-slate-400">
              Click to upload or drag & drop
            </span>
            <input
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="mt-4 text-xs"
              onChange={(e) => setResume(e.target.files?.[0]?.name || "")}
            />
            {resume && (
              <span className="mt-3 text-xs font-semibold text-emerald-600">
                {resume.startsWith("http") ? "Current resume uploaded" : resume}
              </span>
            )}
          </label>
        </section>
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Identification</h2>
          <div className="mt-5 max-w-xl">
            <Field
              label="NIC/Passport No"
              name="nic_passport"
              value={instructor?.nic_passport}
            />
          </div>
        </section>
        <section className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Social Links</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field
              label="Facebook (Optional)"
              name="facebook_url"
              type="url"
              value={instructor?.facebook_url}
              optional
            />
            <Field
              label="Twitter (Optional)"
              name="twitter_url"
              type="url"
              value={instructor?.twitter_url}
              optional
            />
            <Field
              label="Instagram (Optional)"
              name="instagram_url"
              type="url"
              value={instructor?.instagram_url}
              optional
            />
            <Field
              label="LinkedIn (Optional)"
              name="linkedin_url"
              type="url"
              value={instructor?.linkedin_url}
              optional
            />
            <Field
              label="YouTube (Optional)"
              name="youtube_url"
              type="url"
              value={instructor?.youtube_url}
              optional
            />
          </div>
        </section>
      </div>
      {entity === "Staff" && (
        <section
          className={
            staffTab === "permissions"
              ? "relative z-[400] space-y-5 overflow-visible rounded-xl border bg-white p-4 sm:p-6"
              : "hidden"
          }
        >
          <label className="block max-w-md text-sm font-semibold">
            Role <span className="text-red">*</span>
            <RoleCombobox
              value={staffRole}
              onChange={selectStaffRole}
              options={
                availableRoles.length
                  ? availableRoles.map((item) => item.name)
                  : undefined
              }
            />
            <small className="mt-2 block font-normal text-slate-400">
              Select a role to apply its configured permissions to this staff
              account.
            </small>
          </label>
        </section>
      )}
      <div className="flex justify-end">
        <button disabled={busy} className="btn-primary gap-2">
          <Save className="size-4" />
          {busy ? "Saving…" : instructor ? "Save Changes" : `Create ${entity}`}
        </button>
      </div>
    </form>
  );
}
function Field({
  label,
  name,
  value,
  optional,
  ...p
}: {
  label: string;
  name: string;
  value?: string | null;
  optional?: boolean;
  [key: string]: any;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        name={name}
        defaultValue={value || ""}
        {...p}
        className="field mt-2"
        required={!optional}
      />
    </label>
  );
}
function RepeatSection({
  title,
  addLabel,
  add,
  children,
}: {
  title: string;
  addLabel: string;
  add: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        <button type="button" onClick={add} className="btn-secondary gap-2">
          <Plus className="size-4" />
          {addLabel}
        </button>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
function Dynamic({
  label,
  value,
  change,
  type = "text",
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => change(e.target.value)}
        className="field mt-2"
        required
      />
    </label>
  );
}
function update<T extends Record<string, string>>(
  rows: T[],
  index: number,
  key: keyof T,
  value: string,
) {
  return rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
}
