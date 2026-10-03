import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useDialogState } from "../core";
import { useNavigationBlocker } from "../tanstack-router";
import type { ReactElement } from "react";

export function HistoryFixture(): ReactElement {
  const [blocking, setBlocking] = useState(false);
  const [blockedAttempts, setBlockedAttempts] = useState(0);
  const [allowedAttempts, setAllowedAttempts] = useState(0);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { dialogState, confirm, onConfirm, onCancel } = useDialogState();

  useNavigationBlocker({
    when: blocking,
    message: "Leave editor?",
    onConfirm: confirm,
    onBlock: () => {
      setBlockedAttempts((count) => count + 1);
    },
    onAllow: () => {
      setAllowedAttempts((count) => count + 1);
    },
    blockBrowserUnload: false,
  });

  return (
    <main>
      <h1>Browser history confirmation fixture</h1>
      <p>
        Location: <output aria-label="Location">{pathname}</output>
      </p>
      <p>
        Blocked attempts: <output aria-label="Blocked attempts">{blockedAttempts}</output>
      </p>
      <p>
        Allowed attempts: <output aria-label="Allowed attempts">{allowedAttempts}</output>
      </p>
      <label>
        <input
          type="checkbox"
          checked={blocking}
          onChange={(event) => {
            setBlocking(event.target.checked);
          }}
        />
        Protect navigation
      </label>
      <nav aria-label="Destinations">
        <Link to="/">Home</Link> <Link to="/next">Next</Link> <Link to="/other">Other</Link>
      </nav>
      {dialogState && (
        <div role="dialog" aria-label={dialogState.message}>
          <button onClick={onCancel}>Stay</button>
          <button onClick={onConfirm}>Leave</button>
        </div>
      )}
    </main>
  );
}
