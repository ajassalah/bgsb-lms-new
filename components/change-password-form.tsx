"use client";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
export function ChangePasswordForm({
  email,
  avatar,
  name,
}: {
  email: string;
  avatar: string | null;
  name: string;
}) {
  const [show, setShow] = useState([false, false, false]),
    [busy, setBusy] = useState(false),
    [newPassword, setNewPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState("");
  function generatePassword() {
    const groups = [
        "ABCDEFGHJKLMNPQRSTUVWXYZ",
        "abcdefghijkmnopqrstuvwxyz",
        "23456789",
        "!@#$%&*_-+",
      ],
      all = groups.join(""),
      random = (characters: string) => {
        const values = new Uint32Array(1);
        crypto.getRandomValues(values);
        return characters[values[0] % characters.length];
      },
      result = groups.map(random);
    while (result.length < 18) result.push(random(all));
    for (let index = result.length - 1; index > 0; index--) {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      const swap = values[0] % (index + 1);
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    const generated = result.join("");
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShow([false, true, true]);
    toast.success("Strong password generated");
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget,
      f = new FormData(formElement),
      old = String(f.get("old")),
      next = String(f.get("new")),
      confirm = String(f.get("confirm"));
    if (next.length < 8)
      return toast.error("New password must contain at least 8 characters");
    if (next !== confirm) return toast.error("New passwords do not match");
    setBusy(true);
    const db = createClient(),
      { error: verify } = await db.auth.signInWithPassword({
        email,
        password: old,
      });
    if (verify) {
      toast.error("Old password is incorrect");
      setBusy(false);
      return;
    }
    const { error } = await db.auth.updateUser({ password: next });
    if (error) {
      toast.error(error.message);
      setBusy(false);
    } else {
      toast.success("Password updated");
      const emailResponse = await fetch("/api/account/password-changed", {
        method: "POST",
      });
      if (!emailResponse.ok) {
        const emailResult = await emailResponse.json().catch(() => ({}));
        toast.warning(
          `Password updated, but the confirmation email could not be sent: ${emailResult.error || "Email delivery failed"}`,
        );
      } else {
        toast.success("Password-change confirmation sent to your email");
      }
      formElement.reset();
      setNewPassword("");
      setConfirmPassword("");
      setBusy(false);
    }
  }
  return (
    <>
      <p className="text-sm text-slate-400">Account / Change Password</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Change Password</h1>
      <form
        onSubmit={submit}
        className="mx-auto mt-7 max-w-xl rounded-xl border bg-white p-4 sm:p-7"
      >
        <div className="mx-auto grid size-28 place-items-center overflow-hidden rounded-full bg-navy text-3xl font-bold text-white">
          {avatar ? (
            <img src={avatar} className="size-full object-cover" alt="" />
          ) : (
            name[0]
          )}
        </div>
        <div className="mt-7 space-y-5">
          <Password
            label="Old Password"
            name="old"
            show={show[0]}
            toggle={() => setShow((x) => [!x[0], x[1], x[2]])}
          />
          <Password
            label="New Password"
            name="new"
            show={show[1]}
            value={newPassword}
            onChange={setNewPassword}
            toggle={() => setShow((x) => [x[0], !x[1], x[2]])}
          />
          <Password
            label="Confirm New Password"
            name="confirm"
            show={show[2]}
            value={confirmPassword}
            onChange={setConfirmPassword}
            toggle={() => setShow((x) => [x[0], x[1], !x[2]])}
          />
          <button
            type="button"
            onClick={generatePassword}
            className="btn-secondary w-full gap-2"
          >
            <WandSparkles className="size-4" />
            Generate Strong Password
          </button>
        </div>
        <button disabled={busy} className="btn-primary mt-6 w-full gap-2">
          <LockKeyhole className="size-4" />
          {busy ? "Updating…" : "Update Password"}
        </button>
      </form>
    </>
  );
}
function Password({
  label,
  name,
  show,
  toggle,
  value,
  onChange,
}: {
  label: string;
  name: string;
  show: boolean;
  toggle: () => void;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="relative mt-2 block">
        <input
          name={name}
          type={show ? "text" : "password"}
          className="field pr-12"
          value={value}
          onChange={
            onChange ? (event) => onChange(event.target.value) : undefined
          }
          required
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </span>
    </label>
  );
}
