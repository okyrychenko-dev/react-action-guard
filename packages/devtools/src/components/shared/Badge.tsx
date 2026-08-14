import { clsx } from "clsx";
import { CSSProperties, ReactElement, ReactNode } from "react";
import sharedStyles from "../../styles/shared.module.css";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

function Badge(props: BadgeProps): ReactElement {
  const { children, className, style, title } = props;

  return (
    <span className={clsx(sharedStyles.badge, className)} style={style} title={title}>
      {children}
    </span>
  );
}

export default Badge;
