import { clsx } from "clsx";
import { ReactElement } from "react";

interface AffectedElementsProps {
  isBlocked: boolean;
  description?: string;
}

function AffectedElements(props: AffectedElementsProps): ReactElement {
  const { isBlocked, description = "These elements are disabled while blocking is active:" } =
    props;

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
}

export default AffectedElements;
