import { Icon } from "@iconify/react";

const EmptyState = ({
  icon = "mdi:music-note-off",
  title,
  subtitle,
  action,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-6">
    <Icon icon={icon} width={56} className="text-ink-600 mb-4" />
    <h3 className="text-lg font-bold text-white">{title}</h3>
    {subtitle && (
      <p className="text-sm text-ink-500 mt-1 max-w-sm">{subtitle}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
