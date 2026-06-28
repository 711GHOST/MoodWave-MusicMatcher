import { Icon } from "@iconify/react";

// Styled native <select> so it stays accessible and keyboard-friendly.
const Select = ({ value, onChange, options, ariaLabel }) => (
  <div className="relative inline-block">
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-ink-700 hover:bg-ink-600 text-white text-sm font-medium rounded-md py-2 pl-4 pr-10 border border-ink-600 focus:outline-none focus:border-brand cursor-pointer transition"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-ink-800">
          {o.label}
        </option>
      ))}
    </select>
    <Icon
      icon="mdi:chevron-down"
      width={20}
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-300"
    />
  </div>
);

export default Select;
