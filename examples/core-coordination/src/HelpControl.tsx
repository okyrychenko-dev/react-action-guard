import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import type { ReactElement } from "react";

export function HelpControl(): ReactElement {
  const blocked = useIsBlocked("help");
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="help-heading">
      <h2 id="help-heading">Unrelated interaction</h2>
      <button
        disabled={blocked}
        onClick={() => {
          setOpen(!open);
        }}
        aria-expanded={open}
      >
        Show help
      </button>
      {open && <p>Help stays available while your profile saves.</p>}
    </section>
  );
}
