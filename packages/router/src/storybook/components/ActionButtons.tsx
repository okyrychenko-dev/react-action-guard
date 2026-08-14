import { ReactElement } from "react";

interface ActionButtonsProps {
  onSave: () => void;
  onDiscard: () => void;
  disabled: boolean;
  saveLabel?: string;
  discardLabel?: string;
}

function ActionButtons(props: ActionButtonsProps): ReactElement {
  const { disabled, saveLabel = "💾 Save", discardLabel = "🗑️ Discard", onSave, onDiscard } = props;

  return (
    <div className="action-area">
      <button onClick={onSave} className="btn btn-success" disabled={disabled}>
        {saveLabel}
      </button>
      <button onClick={onDiscard} className="btn btn-danger" disabled={disabled}>
        {discardLabel}
      </button>
    </div>
  );
}

export default ActionButtons;
