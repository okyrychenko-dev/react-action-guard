import { useBlockingInfo } from "@okyrychenko-dev/react-action-guard";
import type { ReactElement } from "react";

export function ProfileEditor(): ReactElement {
  const blockers = useBlockingInfo("profile");
  const reason = blockers[0]?.reason ?? "Editing is available.";

  return (
    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile editor</h2>
      <label htmlFor="display-name">Display name</label>
      <input
        aria-describedby="profile-reason"
        id="display-name"
        defaultValue="Alex"
        disabled={blockers.length > 0}
      />
      <p id="profile-reason" role="status">
        {reason}
      </p>
    </section>
  );
}
