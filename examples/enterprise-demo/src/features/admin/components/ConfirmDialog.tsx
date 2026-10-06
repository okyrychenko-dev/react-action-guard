import { Button, Modal } from "@heroui/react";
import type { ReactElement } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isExecuting: boolean;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}

export function ConfirmDialog(props: ConfirmDialogProps): ReactElement {
  const { isOpen, title, message, confirmText, cancelText, isExecuting, onConfirm, onCancel } =
    props;

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog aria-label={title}>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                {cancelText}
              </Button>
              <Button variant="danger" onPress={onConfirm} isDisabled={isExecuting}>
                {confirmText}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
