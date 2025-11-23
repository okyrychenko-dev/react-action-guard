import { clsx } from "clsx";
import { JSX } from "react";

interface AffectedElementsProps {
  isBlocked: boolean;
  description?: string;
}

export const AffectedElements = ({
  isBlocked,
  description = "These elements are disabled while blocking is active:",
}: AffectedElementsProps): JSX.Element => {
  return (
    <div className="affectedTitle">
      <h3>Affected Elements</h3>
      <p className="affectedDescription">{description}</p>

      <div className="affectedRow">
        <button
          disabled={isBlocked}
          className={clsx("secondaryButton", { secondaryButtonDisabled: isBlocked })}
        >
          Button
        </button>

        <input
          disabled={isBlocked}
          placeholder="Input field"
          className={clsx("input", { inputDisabled: isBlocked })}
        />
      </div>
    </div>
  );
};
