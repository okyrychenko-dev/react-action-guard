import { useBlockingInfo } from "@okyrychenko-dev/react-action-guard";
import { useState } from "react";
import type { ReactElement } from "react";

export function NavigationControl(): ReactElement {
  const blockers = useBlockingInfo("navigation");
  const reason = blockers[0]?.reason ?? "Navigation is available.";
  const [destination, setDestination] = useState("Profile page");

  return (
    <section aria-labelledby="navigation-heading">
      <h2 id="navigation-heading">Navigation</h2>
      <button
        disabled={blockers.length > 0}
        aria-describedby="navigation-reason"
        onClick={() => {
          setDestination("Dashboard opened");
        }}
      >
        Open dashboard
      </button>
      <p id="navigation-reason" role="status">
        {reason}
      </p>
      <p>{destination}</p>
    </section>
  );
}
