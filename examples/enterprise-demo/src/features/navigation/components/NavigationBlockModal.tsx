import { Button, Modal } from "@heroui/react";
import type { ReactElement } from "react";

interface NavigationBlockModalProps {
  isOpen: boolean;
  onConfirm: VoidFunction;
  onCancel: VoidFunction;
}

export function NavigationBlockModal(props: NavigationBlockModalProps): ReactElement {
  const { isOpen, onConfirm, onCancel } = props;

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
              <Modal.Heading>Unsaved changes detected</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              The <strong>navigation</strong> scope is guarded — checkout has edits that haven't
              been saved. Leaving now will discard them.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Stay and save
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
