import { ReactElement, ReactNode, SVGProps } from "react";
import { IconProps } from "./Icon.types";

export function createSvgIcon(
  children: ReactNode,
  { viewBox = "0 0 24 24" }: SVGProps<SVGSVGElement> = {}
) {
  return function SvgIcon(props: IconProps): ReactElement {
    const { size = 16, color = "currentColor" } = props;

    return (
      <svg width={size} height={size} viewBox={viewBox} fill={color}>
        {children}
      </svg>
    );
  };
}
