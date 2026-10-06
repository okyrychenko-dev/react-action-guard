import { Button, Modal } from "@heroui/react";
import type { ReactElement } from "react";

interface NavigationBlockModalProps {
  title?: string;
  message?: string;
  cancelLabel?: string;
  isOpen: boolean;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}

export function NavigationBlockModal(props: NavigationBlockModalProps): ReactElement {
  const {
    isOpen,
    onConfirm,
    onCancel,
    title = "Navigation is guarded",
    message = "Navigation is currently guarded. Leave this page anyway?",
    cancelLabel = "Stay here",
  } = props;

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      onCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog aria-label="Navigation blocked">
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                {cancelLabel}
              </Button>
              <Button variant="danger-soft" onPress={onConfirm}>
                Leave anyway
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
