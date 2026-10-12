import { useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import ActionGuardDevtools from "../../ActionGuardDevtools";
import type { ReactElement } from "react";
import type { DevtoolsInspection } from "../../ActionGuardDevtools.types";

interface InspectorTestAppProps {
  name: string;
  inspection?: DevtoolsInspection;
}

function InspectorTestApp({ name, inspection }: InspectorTestAppProps): ReactElement {
  const store = useUIBlockingContext();
  const [firstObserver, setFirstObserver] = useState(true);
  const [secondObserver, setSecondObserver] = useState(true);
  const { addBlocker, clearAllBlockers } = store.getState();

  return (
    <section aria-label={name}>
      <button onClick={() => addBlocker(name, { scope: "checkout", reason: name, timeout: 2_000 })}>
        Add {name}
      </button>
      <button onClick={clearAllBlockers}>Clear {name}</button>
      <button onClick={() => setFirstObserver((current) => !current)}>Toggle first {name}</button>
      <button onClick={() => setSecondObserver((current) => !current)}>Toggle second {name}</button>
      {firstObserver && (
        <section aria-label={`First ${name}`}>
          <ActionGuardDevtools store={store} defaultOpen inspection={inspection} />
        </section>
      )}
      {secondObserver && (
        <section aria-label={`Second ${name}`}>
          <ActionGuardDevtools store={store} defaultOpen inspection={inspection} />
        </section>
      )}
    </section>
  );
}

export default InspectorTestApp;
