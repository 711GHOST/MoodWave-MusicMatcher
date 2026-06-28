const TextInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
}) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label htmlFor={name || label} className="text-sm font-semibold text-white">
        {label}
      </label>
    )}
    <input
      id={name || label}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white placeholder-ink-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
    />
  </div>
);

export default TextInput;
