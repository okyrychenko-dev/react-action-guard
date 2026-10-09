import { useAsyncAction, useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import { simulateSave } from "./save.utils";
import type { ReactElement } from "react";

export function SavePanel(): ReactElement {
  const runSave = useAsyncAction("save-profile", ["profile", "navigation"]);
  const blocked = useIsBlocked("profile");
  const [status, setStatus] = useState("Ready to save.");
  const [shouldFail, setShouldFail] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(): Promise<void> {
    setStatus("Saving profile…");
    setError("");
    try {
      await runSave(() => simulateSave(shouldFail));
      setStatus("Profile saved.");
    } catch {
      setStatus("Save finished with an error.");
      setError("Save failed. Try again.");
    }
  }

  return (
    <section aria-labelledby="save-heading">
      <h2 id="save-heading">Save operation</h2>
      <p>A simulated save takes 1.2 seconds. No server or extra adapter package is needed.</p>
      <label>
        <input
          type="checkbox"
          checked={shouldFail}
          disabled={blocked}
          onChange={(event) => {
            setShouldFail(event.target.checked);
          }}
        />
        Simulate save failure
      </label>
      <button
        disabled={blocked}
        onClick={() => {
          void handleSave();
        }}
      >
        Save profile
      </button>
      <p role="status">{status}</p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
