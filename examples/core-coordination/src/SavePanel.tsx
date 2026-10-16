import {
  useAsyncAction,
  useIsBlocked,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { isError } from "@okyrychenko-dev/type-utils";
import { useState } from "react";
import { simulateSave } from "./save.utils";
import type { ChangeEventHandler, ReactElement } from "react";

export function SavePanel(): ReactElement {
  const store = useUIBlockingContext();
  const runSave = useAsyncAction("save-profile", ["profile", "navigation"]);
  const blocked = useIsBlocked("profile");
  const [status, setStatus] = useState("Ready to save.");
  const [shouldFail, setShouldFail] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(): Promise<void> {
    const { isBlocked } = store.getState();

    if (isBlocked("profile")) {
      setStatus("Save command blocked: profile is busy.");

      return;
    }

    setStatus("Saving profile…");
    setError("");

    try {
      await runSave(() => simulateSave(shouldFail));
      setStatus("Profile saved.");
    } catch (error) {
      setStatus("Save finished with an error.");
      setError(isError(error) ? error.message : "Save failed. Try again.");
    }
  }

  const handleFailureChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setShouldFail(event.target.checked);
  };

  const handleSaveClick: VoidFunction = () => {
    void handleSave();
  };

  return (
    <section aria-labelledby="save-heading">
      <h2 id="save-heading">Save operation</h2>
      <p>A simulated save takes 1.2 seconds. No server or extra adapter package is needed.</p>
      <label>
        <input
          type="checkbox"
          checked={shouldFail}
          disabled={blocked}
          onChange={handleFailureChange}
        />
        Simulate save failure
      </label>
      <button disabled={blocked} onClick={handleSaveClick}>
        Save profile
      </button>
      <button onClick={handleSaveClick}>Invoke save command</button>
      <p>This enabled entry point calls the same guarded command as the disabled save button.</p>
      <p role="status">{status}</p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
