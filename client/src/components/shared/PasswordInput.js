import { useState } from "react";
import { Icon } from "@iconify/react";

const PasswordInput = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={name || label}
          className="text-sm font-semibold text-white"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name || label}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-11 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white"
        >
          <Icon icon={show ? "mdi:eye-off" : "mdi:eye"} width={20} />
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
