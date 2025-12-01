import { clsx } from "clsx";
import { JSX, useState } from "react";
import { DebugPanel, StoryContainer } from "../../storybook/components";
import { useBlocker } from "../useBlocker";
import { useBlockingInfo } from "./useBlockingInfo";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../storybook/components/shared.stories.css";
import "./useBlockingInfo.stories.css";

interface BlockingInfoDemoProps {
  scope?: string;
}

const BlockingInfoDemo = ({ scope = "checkout" }: BlockingInfoDemoProps): JSX.Element => {
  const [blocker1Active, setBlocker1Active] = useState(false);
  const [blocker2Active, setBlocker2Active] = useState(false);
  const [blocker3Active, setBlocker3Active] = useState(false);

  // Get detailed blocker information
  const blockers = useBlockingInfo(scope);
  const globalBlockers = useBlockingInfo("global");

  // Individual blockers with different priorities
  useBlocker(
    "payment-processing",
    { scope, reason: "Payment is being processed", priority: 90 },
    blocker1Active
  );
  useBlocker(
    "inventory-check",
    { scope, reason: "Checking inventory availability", priority: 50 },
    blocker2Active
  );
  useBlocker(
    "global-maintenance",
    { scope: "global", reason: "System maintenance in progress", priority: 100 },
    blocker3Active
  );

  return (
    <StoryContainer title="useBlockingInfo Demo">
      <p className="description">
        This hook returns detailed information about all active blockers for a specific scope,
        sorted by priority (highest first). Unlike <code>useIsBlocked</code> which returns a
        boolean, this hook gives you access to blocker details like reason, priority, and timestamp.
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
            <span>Payment Processing (Priority: 90)</span>
          </label>

          <label className="controlLabel">
            <input
              type="checkbox"
              checked={blocker2Active}
              onChange={(e) => {
                setBlocker2Active(e.target.checked);
              }}
            />
            <span>Inventory Check (Priority: 50)</span>
          </label>

          <label className="controlLabel">
            <input
              type="checkbox"
              checked={blocker3Active}
              onChange={(e) => {
                setBlocker3Active(e.target.checked);
              }}
            />
            <span>Global Maintenance (Priority: 100)</span>
          </label>
        </div>
      </div>

      {/* Blocker Information Cards */}
      <div className="blockerInfoSection">
        <div className="blockerInfoColumn">
          <h3 className="blockerInfoTitle">
            Scope: "{scope}" ({blockers.length} blocker{blockers.length !== 1 ? "s" : ""})
          </h3>

          {blockers.length === 0 ? (
            <div className="emptyState">
              <span className="emptyStateIcon">✅</span>
              <p className="emptyStateText">No active blockers for this scope</p>
            </div>
          ) : (
            <div className="blockerList">
              {blockers.map((blocker, index) => (
                <div key={blocker.id} className="blockerCard">
                  <div className="blockerCardHeader">
                    <span className="blockerCardBadge">#{index + 1}</span>
                    <code className="blockerCardId">{blocker.id}</code>
                    <span className="blockerCardPriority">Priority: {blocker.priority}</span>
                  </div>
                  <div className="blockerCardBody">
                    <div className="blockerCardRow">
                      <strong>Reason:</strong>
                      <span>{blocker.reason || "No reason provided"}</span>
                    </div>
                    <div className="blockerCardRow">
                      <strong>Scope:</strong>
                      <code>
                        {Array.isArray(blocker.scope) ? blocker.scope.join(", ") : blocker.scope}
                      </code>
                    </div>
                    <div className="blockerCardRow">
                      <strong>Added:</strong>
                      <span>{new Date(blocker.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="blockerInfoColumn">
          <h3 className="blockerInfoTitle">
            Scope: "global" ({globalBlockers.length} blocker{globalBlockers.length !== 1 ? "s" : ""}
            )
          </h3>

          {globalBlockers.length === 0 ? (
            <div className="emptyState">
              <span className="emptyStateIcon">✅</span>
              <p className="emptyStateText">No global blockers active</p>
            </div>
          ) : (
            <div className="blockerList">
              {globalBlockers.map((blocker, index) => (
                <div key={blocker.id} className="blockerCard">
                  <div className="blockerCardHeader">
                    <span className="blockerCardBadge">#{index + 1}</span>
                    <code className="blockerCardId">{blocker.id}</code>
                    <span className="blockerCardPriority">Priority: {blocker.priority}</span>
                  </div>
                  <div className="blockerCardBody">
                    <div className="blockerCardRow">
                      <strong>Reason:</strong>
                      <span>{blocker.reason || "No reason provided"}</span>
                    </div>
                    <div className="blockerCardRow">
                      <strong>Added:</strong>
                      <span>{new Date(blocker.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Example Use Case */}
      <div className="useCaseSection">
        <h3>Example: Smart Checkout Button</h3>
        <p className="useCaseDescription">
          This button shows the highest priority blocker's reason as a tooltip:
        </p>

        <div className="useCaseDemo">
          <button
            disabled={blockers.length > 0}
            className={clsx("checkoutButton", { checkoutButtonDisabled: blockers.length > 0 })}
            title={
              blockers.length > 0
                ? `Blocked: ${blockers[0]?.reason ?? "Unknown"} (${blockers.length.toString()} active blocker${blockers.length !== 1 ? "s" : ""})`
                : "Proceed to checkout"
            }
          >
            {blockers.length > 0 ? (
              <>
                🔒 Checkout Blocked ({blockers.length})
                <span className="checkoutButtonSubtext">{blockers[0]?.reason}</span>
              </>
            ) : (
              <>✅ Proceed to Checkout</>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="infoBox">
        <strong className="infoTitle">💡 How it works:</strong>
        <ul className="infoList">
          <li>
            Returns an array of <code>BlockerInfo</code> objects with id, reason, priority, scope,
            and timestamp
          </li>
          <li>Blockers are automatically sorted by priority (highest first)</li>
          <li>
            Use <code>blockers[0]</code> to get the highest priority blocker
          </li>
          <li>
            Use <code>blockers.length</code> to check if any blockers are active
          </li>
          <li>Perfect for showing detailed blocking reasons in tooltips or error messages</li>
        </ul>
      </div>

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof BlockingInfoDemo> = {
  title: "Hooks/useBlockingInfo",
  component: BlockingInfoDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook for getting detailed information about all active blockers for a specific scope. " +
          "Unlike useIsBlocked which returns a boolean, this hook returns an array of blocker objects " +
          "with details like reason, priority, timestamp, etc. Blockers are automatically sorted by priority " +
          "(highest first). Perfect for showing detailed blocking reasons in your UI.",
      },
    },
  },
  argTypes: {
    scope: {
      control: "text",
      description: "Scope to get blocker information for.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "checkout" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BlockingInfoDemo>;

export const Basic: Story = {
  args: {
    scope: "checkout",
  },
};

export const FormScope: Story = {
  args: {
    scope: "form",
  },
  parameters: {
    docs: {
      description: {
        story: "Example with form validation scope showing detailed blocker information.",
      },
    },
  },
};

export const PaymentScope: Story = {
  args: {
    scope: "payment",
  },
  parameters: {
    docs: {
      description: {
        story: "Example with payment processing scope.",
      },
    },
  },
};
