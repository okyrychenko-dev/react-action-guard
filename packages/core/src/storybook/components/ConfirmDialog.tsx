import { ReactElement, ReactNode } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  emphasis?: string;
  icon?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog(props: ConfirmDialogProps): ReactElement {
  const {
    title,
    message,
    emphasis,
    icon = "⚠️",
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  } = props;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <span className="dialog-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <div className="dialog-body">
          <p>{message}</p>
          {emphasis && (
            <p>
              <strong>{emphasis}</strong>
            </p>
          )}
        </div>
        <div className="dialog-footer">
          <button onClick={onCancel} className="btn btn-primary">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
