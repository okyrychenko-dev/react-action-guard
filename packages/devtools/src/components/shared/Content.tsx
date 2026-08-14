import { clsx } from "clsx";
import { ReactElement, ReactNode } from "react";
import sharedStyles from "../../styles/shared.module.css";

interface ContentProps {
  children: ReactNode;
  className?: string;
}

function Content(props: ContentProps): ReactElement {
  const { children, className } = props;

  return <div className={clsx(sharedStyles.content, className)}>{children}</div>;
}

export default Content;
