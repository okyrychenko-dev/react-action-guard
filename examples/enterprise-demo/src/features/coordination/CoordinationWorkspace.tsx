import { useGuardedButton, useGuardedField } from "@okyrychenko-dev/react-action-guard-ui";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { useState } from "react";
import { COORDINATION_SCOPES } from "./coordination.constants";
import { useCoordinationWorkflow } from "./useCoordinationWorkflow";
import type { ChangeEventHandler, ReactElement } from "react";

export function CoordinationWorkspace(): ReactElement {
  const {
    value,
    revision,
    savedRevision,
    pending,
    message,
    start,
    complete,
    fail,
    cancel,
    edit,
    save,
  } = useCoordinationWorkflow();
  const { buttonState } = useGuardedButton({ scope: COORDINATION_SCOPES });
  const { buttonState: helpState } = useGuardedButton({ scope: "help" });
  const { fieldState } = useGuardedField({ scope: "property" });
  const [helpOpen, setHelpOpen] = useState(false);
  const running = isDefined(pending);
  const controlsDisabled = running || buttonState.disabled;
  const handleValueChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    edit(event.target.value);
  };

  const handleStartAgent: VoidFunction = () => {
    start("agent");
  };

  const handleStartRecalculation: VoidFunction = () => {
    start("user");
  };

  const handleToggleHelp: VoidFunction = () => {
    setHelpOpen((current) => !current);
  };

  return (
    <section
      aria-label="User and agent coordination"
      className="mt-6 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
    >
      <h2 className="text-lg font-semibold">User and agent coordination</h2>
      <p>
        Start a simulated agent edit or manual recalculation. Both protect property, revision and
        recalculation scopes until you settle the operation.
      </p>
      <label className="flex flex-col gap-2">
        Property value
        <input
          className="w-full rounded border p-2"
          value={value}
          disabled={running || fieldState.disabled}
          onChange={handleValueChange}
        />
      </label>
      <p>Revision: {revision}</p>
      <p>Saved revision: {savedRevision}</p>
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={controlsDisabled}
          onClick={handleStartAgent}
        >
          Start agent edit
        </button>
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={controlsDisabled}
          onClick={handleStartRecalculation}
        >
          Recalculate manually
        </button>
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={controlsDisabled}
          onClick={save}
        >
          Save revision
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!running}
          onClick={complete}
        >
          Complete operation
        </button>
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!running}
          onClick={fail}
        >
          Fail operation
        </button>
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!running}
          onClick={cancel}
        >
          Cancel operation
        </button>
        <button
          className="rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={helpState.disabled}
          aria-expanded={helpOpen}
          onClick={handleToggleHelp}
        >
          Help and chat
        </button>
      </div>
      <p role="status">{message}</p>
      {helpOpen && (
        <p>
          Read-only help remains available while the shared edit scopes are protected. This
          simulated chat does not contact an external provider.
        </p>
      )}
      <p className="text-sm text-slate-600">
        This is a controllable simulation using public guard hooks. Permissions, idempotency,
        cancellation and conflicting execution exclusion belong to the application/backend. The demo
        rejects repeat starts; a blocker alone is not an execution lock. Leaving or resetting
        discards pending proposals.
      </p>
    </section>
  );
}
