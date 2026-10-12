import { useActionBlocker, useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { type Optional, assertNever, isDefined, isUndefined } from "@okyrychenko-dev/type-utils";
import { useRef, useState } from "react";
import { COORDINATION_SCOPES } from "./coordination.constants";
import type { CoordinationWorkflow, OperationSource, PendingOperation } from "./coordination.types";

export function useCoordinationWorkflow(): CoordinationWorkflow {
  const store = useResolvedStoreApi();
  const [value, setValue] = useState("Original property");
  const [revision, setRevision] = useState(1);
  const [savedRevision, setSavedRevision] = useState(1);
  const [pending, setPending] = useState<Optional<PendingOperation>>(undefined);
  const pendingRef = useRef<Optional<PendingOperation>>(undefined);
  const [message, setMessage] = useState("Ready for user or agent changes");
  let reason = "User is recalculating the current revision";
  if (pending?.source === "agent") {
    reason = "Agent is editing property and recalculating revision";
  }
  useActionBlocker(
    "coordinated-revision",
    { scope: COORDINATION_SCOPES, reason },
    isDefined(pending)
  );

  const canChange = (): boolean => {
    const { isBlocked } = store.getState();
    return isUndefined(pendingRef.current) && !isBlocked(COORDINATION_SCOPES);
  };

  const start = (source: OperationSource): void => {
    if (!canChange()) {
      return;
    }
    let proposedValue = value;
    let nextMessage = "User is recalculating the current revision";
    if (source === "agent") {
      proposedValue = "Agent proposal";
      nextMessage = "Agent is editing property and recalculating revision";
    }
    const operation = { source, proposedValue };
    pendingRef.current = operation;
    setPending(operation);
    setMessage(nextMessage);
  };

  const settle = (outcome: "success" | "failure" | "cancel"): void => {
    const operation = pendingRef.current;
    if (isUndefined(operation)) {
      return;
    }
    pendingRef.current = undefined;
    setPending(undefined);
    switch (outcome) {
      case "success":
        setValue(operation.proposedValue);
        setRevision((current) => current + 1);
        setMessage("Operation completed; shared scopes released");
        break;
      case "failure":
        setMessage("Operation failed; property unchanged and shared scopes released");
        break;
      case "cancel":
        setMessage("Operation cancelled; property unchanged and shared scopes released");
        break;
      default:
        assertNever(outcome);
    }
  };

  const edit = (nextValue: string): void => {
    if (canChange()) {
      setValue(nextValue);
      setRevision((current) => current + 1);
    }
  };

  const save = (): void => {
    if (canChange()) {
      setSavedRevision(revision);
      setMessage("Revision saved by the user");
    }
  };

  return {
    value,
    revision,
    savedRevision,
    pending,
    message,
    start,
    edit,
    save,
    complete: () => {
      settle("success");
    },
    fail: () => {
      settle("failure");
    },
    cancel: () => {
      settle("cancel");
    },
  };
}
