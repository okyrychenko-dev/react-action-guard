import { clsx } from "clsx";
import { ButtonHTMLAttributes, ReactElement } from "react";
import sharedStyles from "../../styles/shared.module.css";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function IconButton(props: IconButtonProps): ReactElement {
  const { children, className, type = "button", ...others } = props;

  return (
    <button type={type} className={clsx(sharedStyles.iconButton, className)} {...others}>
      {children}
    </button>
  );
}

export default IconButton;
