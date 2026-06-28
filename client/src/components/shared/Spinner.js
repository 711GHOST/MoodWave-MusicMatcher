import { Icon } from "@iconify/react";

const Spinner = ({ size = 24, className = "" }) => (
  <Icon
    icon="line-md:loading-twotone-loop"
    width={size}
    height={size}
    className={`text-brand ${className}`}
  />
);

export default Spinner;
