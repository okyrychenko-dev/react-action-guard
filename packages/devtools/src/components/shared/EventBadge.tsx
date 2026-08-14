import { clsx } from "clsx";
import { CSSProperties, ReactElement, ReactNode } from "react";
import sharedStyles from "../../styles/shared.module.css";

interface EventBadgeProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  action?: string;
}

function EventBadge(props: EventBadgeProps): ReactElement {
  const { children, className, style, action } = props;

  const classes = clsx(sharedStyles.eventBadge, action && sharedStyles.eventBadgeAction, className);

  return (
    <span className={classes} style={style} data-action={action}>
      {children}
    </span>
  );
}

export default EventBadge;
