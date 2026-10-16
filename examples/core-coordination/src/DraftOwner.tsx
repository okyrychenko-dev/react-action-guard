import { useActionBlocker } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import type { ChangeEventHandler, ReactElement } from "react";

interface DraftOwnerProps {
  ownerId: string;
}

export function DraftOwner(props: DraftOwnerProps): ReactElement {
  const { ownerId } = props;

  const [dirty, setDirty] = useState(false);

  useActionBlocker(
    `draft-editor-${ownerId}`,
    { scope: "navigation", reason: `Editor ${ownerId} has unsaved changes.` },
    dirty
  );

  const handleDirtyChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setDirty(event.target.checked);
  };

  return (
    <label>
      <input type="checkbox" checked={dirty} onChange={handleDirtyChange} />
      Keep editor {ownerId} draft
    </label>
  );
}
