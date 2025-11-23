import { clsx } from "clsx";
import { JSX, useState } from "react";
import { DebugPanel, StoryContainer } from "../../storybook/components";
import { useBlocker } from "../useBlocker";
import { useIsBlocked } from "./useIsBlocked";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";
import "./useIsBlocked.stories.css";

interface IsBlockedDemoProps {
  scope?: string;
}

const IsBlockedDemo = ({ scope = "demo-scope" }: IsBlockedDemoProps): JSX.Element => {
  const [blocker1Active, setBlocker1Active] = useState(false);
  const [blocker2Active, setBlocker2Active] = useState(false);
  const [blocker3Active, setBlocker3Active] = useState(false);

  // Check different scopes
  const isBlockedDemo = useIsBlocked(scope);
  const isBlockedGlobal = useIsBlocked("global");
  const isBlockedAny = useIsBlocked();

  // Individual blockers
  useBlocker("blocker-1", { scope, reason: "Blocker 1 active" }, blocker1Active);
  useBlocker("blocker-2", { scope, reason: "Blocker 2 active" }, blocker2Active);
  useBlocker(
    "global-blocker",
    { scope: "global", reason: "Global blocker active" },
    blocker3Active
  );

  return (
    <StoryContainer title="useIsBlocked Demo">
      <p className="description">
        This hook checks if UI is currently blocked for a specific scope or globally.
      </p>

      {/* Control Panel */}
      <div className="controlPanel">
        <h3 className="controlTitle">Control Blockers</h3>
        <div className="controlList">
          <label className="controlLabel">
            <input
              type="checkbox"
              checked={blocker1Active}
              onChange={(e) => {
                setBlocker1Active(e.target.checked);
              }}
            />
            <span>Blocker 1 (scope: {scope})</span>
          </label>

          <label className="controlLabel">
            <input
              type="checkbox"
              checked={blocker2Active}
              onChange={(e) => {
                setBlocker2Active(e.target.checked);
              }}
            />
            <span>Blocker 2 (scope: {scope})</span>
          </label>

          <label className="controlLabel">
            <input
              type="checkbox"
              checked={blocker3Active}
              onChange={(e) => {
                setBlocker3Active(e.target.checked);
              }}
            />
            <span>Global Blocker (scope: global)</span>
          </label>
        </div>
      </div>

      {/* Status Cards */}
      <div className="statusGrid">
        <div
          className={clsx("statusCard", isBlockedDemo ? "statusCardBlocked" : "statusCardReady")}
        >
          <div className="statusRow">
            <span className="statusIcon">{isBlockedDemo ? "🔒" : "✅"}</span>
            <div>
              <code className="statusCode">useIsBlocked(&quot;{scope}&quot;)</code>
              <div className="statusState">
                <strong>{isBlockedDemo ? "BLOCKED" : "NOT BLOCKED"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div
          className={clsx("statusCard", isBlockedGlobal ? "statusCardBlocked" : "statusCardReady")}
        >
          <div className="statusRow">
            <span className="statusIcon">{isBlockedGlobal ? "🔒" : "✅"}</span>
            <div>
              <code className="statusCode">useIsBlocked(&quot;global&quot;)</code>
              <div className="statusState">
                <strong>{isBlockedGlobal ? "BLOCKED" : "NOT BLOCKED"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={clsx("statusCard", isBlockedAny ? "statusCardBlocked" : "statusCardReady")}>
          <div className="statusRow">
            <span className="statusIcon">{isBlockedAny ? "🔒" : "✅"}</span>
            <div>
              <code className="statusCode">useIsBlocked()</code>
              <div className="statusState">
                <strong>{isBlockedAny ? "BLOCKED" : "NOT BLOCKED"}</strong>
                <span className="statusStateNote">(any scope)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="infoBox">
        <strong className="infoTitle">💡 How it works:</strong>
        <ul className="infoList">
          <li>
            <code>useIsBlocked(&quot;{scope}&quot;)</code> - Returns true if ANY blocker with scope
            &quot;{scope}&quot; or &quot;global&quot; is active
          </li>
          <li>
            <code>useIsBlocked(&quot;global&quot;)</code> - Returns true only if a global blocker is
            active
          </li>
          <li>
            <code>useIsBlocked()</code> - Returns true if ANY blocker is active (any scope)
          </li>
        </ul>
      </div>

      {/* Example UI Elements */}
      <div className="actionsSection">
        <h3>Example: Disabled Elements</h3>
        <p className="actionsHint">
          These elements use <code>isBlockedDemo</code> to determine their disabled state:
        </p>

        <div className="actionsRow">
          <button
            disabled={isBlockedDemo}
            className={clsx("primaryButton", { primaryButtonDisabled: isBlockedDemo })}
          >
            Action Button
          </button>

          <input
            disabled={isBlockedDemo}
            placeholder="Input field"
            className={clsx("input", { inputDisabled: isBlockedDemo })}
          />

          <button
            disabled={isBlockedDemo}
            className={clsx("secondaryButton", { secondaryButtonDisabled: isBlockedDemo })}
          >
            Save
          </button>
        </div>
      </div>

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof IsBlockedDemo> = {
  title: "Hooks/useIsBlocked",
  component: IsBlockedDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook for checking if the UI is currently blocked for a specific scope or globally. " +
          "Returns a boolean that updates reactively when blockers are added or removed. " +
          "This is the primary hook for determining whether UI elements should be disabled.",
      },
    },
  },
  argTypes: {
    scope: {
      control: "text",
      description: "Scope to check. If omitted, checks all scopes.",
      table: {
        type: { summary: "string | string[] | undefined" },
        defaultValue: { summary: "demo-scope" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof IsBlockedDemo>;

export const Basic: Story = {
  args: {
    scope: "demo-scope",
  },
};

export const CustomScope: Story = {
  args: {
    scope: "payment-scope",
  },
  parameters: {
    docs: {
      description: {
        story: "Example with a custom scope name 'payment-scope'.",
      },
    },
  },
};

export const FormScope: Story = {
  args: {
    scope: "form-validation",
  },
  parameters: {
    docs: {
      description: {
        story: "Example showing form validation scope blocking.",
      },
    },
  },
};
