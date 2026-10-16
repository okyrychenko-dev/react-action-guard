import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import type { ReactElement } from "react";

export function HelpControl(): ReactElement {
  const blocked = useIsBlocked("help");
  const [open, setOpen] = useState(false);

  const handleToggleHelp: VoidFunction = () => {
    setOpen(!open);
  };

  return (
    <section aria-labelledby="help-heading">
      <h2 id="help-heading">Unrelated interaction</h2>
      <button aria-expanded={open} disabled={blocked} onClick={handleToggleHelp}>
        Show help
      </button>
      {open && <p>Help stays available while your profile saves.</p>}
    </section>
  );
}
