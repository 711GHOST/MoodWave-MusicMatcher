// Inline-SVG Moodwave logo (scalable; replaces the old PNG assets).
const Brand = ({ withText = true, iconSize = 32, className = "" }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="mw-grad"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1ed760" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#mw-grad)" />
      <g fill="#0d0d12">
        <rect x="8.5" y="13" width="2.6" height="6" rx="1.3" />
        <rect x="13.1" y="8.5" width="2.6" height="15" rx="1.3" />
        <rect x="17.7" y="11" width="2.6" height="10" rx="1.3" />
        <rect x="22.3" y="14" width="2.6" height="4" rx="1.3" />
      </g>
    </svg>
    {withText && (
      <span className="font-extrabold text-xl tracking-tight text-white">
        Mood<span className="text-brand">wave</span>
      </span>
    )}
  </span>
);

export default Brand;
