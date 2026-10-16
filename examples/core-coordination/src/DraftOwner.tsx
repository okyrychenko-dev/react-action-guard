import { useActionBlocker } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import type { ReactElement } from "react";

export function DraftOwner({ ownerId }: { ownerId: string }): ReactElement {
  const [dirty, setDirty] = useState(false);

  useActionBlocker(
    `draft-editor-${ownerId}`,
    { scope: "navigation", reason: `Editor ${ownerId} has unsaved changes.` },
    dirty
  );

  return (
    <label>
      <input
        type="checkbox"
        checked={dirty}
        onChange={(event) => {
          setDirty(event.target.checked);
        }}
      />
      Keep editor {ownerId} draft
    </label>
  );
}
