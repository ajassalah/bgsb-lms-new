"use client";
/** Atlassian Design System form controls shared across the portal. */
import { useState } from "react";
import { Check, X } from "lucide-react";

/**
 * ADS toggle. Controlled (`checked` + `onChange`) or uncontrolled
 * (`defaultChecked`). Pass `name` to submit "on" with a surrounding <form>.
 */
export function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  name,
  label,
  disabled = false,
  size = "regular",
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
  name?: string;
  label?: string;
  disabled?: boolean;
  size?: "regular" | "large";
}) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          if (checked === undefined) setInner(!on);
          onChange?.(!on);
        }}
        className={`ds-toggle ${size === "large" ? "ds-toggle-lg" : ""}`}
      >
        <Check aria-hidden className="ds-toggle-icon ds-toggle-on" strokeWidth={3} />
        <X aria-hidden className="ds-toggle-icon ds-toggle-off" strokeWidth={3} />
        <span aria-hidden className="ds-toggle-knob" />
      </button>
      {name && on && <input type="hidden" name={name} value="on" />}
    </>
  );
}
