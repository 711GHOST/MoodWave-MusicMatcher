import { BRAND_INFO } from "../../utils/cardBrand";

// Small coloured brand badge shown live inside the card-number field.
const CardBrandBadge = ({ brand }) => {
  if (!brand || !BRAND_INFO[brand]) {
    return null;
  }
  const { label, color } = BRAND_INFO[brand];
  return (
    <span
      className="px-2 py-0.5 rounded text-[11px] font-extrabold text-white shadow-sm tracking-wide animate-fade-in"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
};

export default CardBrandBadge;
