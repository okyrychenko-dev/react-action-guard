import { useBlocker, useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useState } from "react";
import { useNavigationBlocker } from "../react-router";
import {
  DebugPanel,
  InfoBox,
  MockRouterProvider,
  NavigationSimulator,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";
import "../storybook/components/ScopeSync.css";

/**
 * THE KILLER FEATURE: Scope Synchronization
 *
 * This demo shows the most powerful pattern - syncing UI blocking with navigation blocking
 * using the same scope. When a scope is active:
 * - UI is blocked (react-action-guard)
 * - Navigation is blocked (this package)
 * - Browser close/refresh is blocked
 */

interface ScopeSyncDemoProps {
  scope?: string;
}

const ScopeSyncDemo = ({ scope = "payment" }: ScopeSyncDemoProps): ReactElement => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isBlocked = useIsBlocked(scope);

  // UI Blocking
  useBlocker(
    "payment-processing",
    {
      scope,
      reason: "Processing payment...",
      priority: 90,
    },
    isProcessing
  );

  // Navigation Blocking (same scope!)
  useNavigationBlocker({
    scope,
    message: "Payment is being processed. Leaving will cancel the transaction.",
    onBlock: () => {
      console.log("🚫 Navigation blocked - payment in progress");
    },
    onAllow: () => {
      console.log("✅ Navigation allowed - payment complete");
    },
  });

  const handleStartPayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  return (
    <StoryContainer title="Scope Synchronization Demo">
      <div className="hero">
        <h3>🎯 The Killer Feature</h3>
        <p>
          One scope controls <strong>BOTH</strong> UI and navigation blocking!
        </p>
      </div>

      <InfoBox className="mb-20">
        <p>
          <strong>🔄 Scope Synchronization:</strong> Multiple components can share the same blocking
          scope. When any component in the scope blocks, all components in that scope are blocked.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={isBlocked}
        blockedMessage={`🔒 BLOCKED - Scope: ${scope}`}
        readyMessage={`✅ READY - Scope: ${scope}`}
      />

      <div className="action-area">
        <button
          onClick={() => {
            void handleStartPayment();
          }}
          disabled={isProcessing}
          className={`btn ${isProcessing ? "btn-danger" : "btn-primary"}`}
        >
          {isProcessing ? "⏳ Processing Payment..." : "💳 Start Payment"}
        </button>
      </div>

      <div className="sync-grid">
        <div className={`sync-card ${isBlocked ? "sync-card-blocked" : ""}`}>
          <div className="sync-icon">🖥️</div>
          <div className="sync-title">UI Blocking</div>
          <div className="sync-status">{isBlocked ? "Blocked by scope" : "Not blocked"}</div>
          <p className="sync-desc">react-action-guard blocks UI interactions</p>
        </div>

        <div className={`sync-card ${isBlocked ? "sync-card-blocked" : ""}`}>
          <div className="sync-icon">🧭</div>
          <div className="sync-title">Navigation Blocking</div>
          <div className="sync-status">{isBlocked ? "Blocked by scope" : "Not blocked"}</div>
          <p className="sync-desc">This package blocks route changes</p>
        </div>

        <div className={`sync-card ${isBlocked ? "sync-card-blocked" : ""}`}>
          <div className="sync-icon">🌐</div>
          <div className="sync-title">Browser Protection</div>
          <div className="sync-status">{isBlocked ? "Blocked" : "Not blocked"}</div>
          <p className="sync-desc">beforeunload prevents tab close</p>
        </div>
      </div>

      <NavigationSimulator isBlocked={isBlocked} />

      <InfoBox className="mt-20">
        <p>
          <strong>💡 How it works:</strong>
        </p>
        <ul className="list">
          <li>
            Each component can join a blocking scope using <code>useBlocker</code>
          </li>
          <li>Any component in the scope can activate blocking</li>
          <li>All components in the same scope see the same blocking state</li>
          <li>Perfect for coordinating guards across multiple UI elements</li>
        </ul>
      </InfoBox>

      <DebugPanel />
    </StoryContainer>
  );
};

const meta: Meta<typeof ScopeSyncDemo> = {
  title: "Integration/Scope Synchronization",
  component: ScopeSyncDemo,
  decorators: [
    (Story) => (
      <MockRouterProvider>
        <Story />
      </MockRouterProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**THE KILLER FEATURE:** Synchronize UI blocking with navigation blocking using the same scope. " +
          "When a scope is active, both UI interactions AND navigation are blocked simultaneously. " +
          "This creates a seamless, foolproof blocking experience for critical operations like payments, " +
          "file uploads, or multi-step forms.",
      },
    },
  },
  argTypes: {
    scope: {
      control: "text",
      description: "Scope name to synchronize UI and navigation blocking",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "payment" },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ScopeSyncDemo>;

export const PaymentFlow: Story = {
  args: {
    scope: "payment",
  },
  parameters: {
    docs: {
      description: {
        story:
          '💳 **Payment Processing Demo** - Click "Start Payment" to see all 3 blocking types activate together. ' +
          "Try navigating while payment is processing - you will be blocked!",
      },
    },
  },
};

export const FileUpload: Story = {
  args: {
    scope: "upload",
  },
  parameters: {
    docs: {
      description: {
        story:
          '📤 **File Upload Demo** - Uses "upload" scope. Perfect for preventing navigation during large file uploads. ' +
          "Click the button to simulate an upload and try to navigate away.",
      },
    },
  },
};

export const MultiStepForm: Story = {
  args: {
    scope: "form-wizard",
  },
  parameters: {
    docs: {
      description: {
        story:
          '📝 **Multi-Step Form Demo** - Uses "form-wizard" scope. During form submission, both UI and navigation are blocked. ' +
          "This prevents users from losing progress in complex multi-step flows.",
      },
    },
  },
};

export const DataSync: Story = {
  args: {
    scope: "data-sync",
  },
  parameters: {
    docs: {
      description: {
        story:
          '🔄 **Data Synchronization Demo** - Uses "data-sync" scope. Blocks UI and navigation during critical data operations. ' +
          "Essential for ensuring data integrity in real-time sync scenarios.",
      },
    },
  },
};
