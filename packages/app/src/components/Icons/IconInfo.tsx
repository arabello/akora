import { IconProps, svgIconProps } from "@buildo/bento-design-system";

export function IconInfo(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      {...svgIconProps(props)}
    >
      <path d="M2,12A10,10 0 1,0 22,12A10,10 0 1,0 2,12" />
      <path d="M12,16V12" />
      <path d="M12,10V8" />
    </svg>
  );
}
