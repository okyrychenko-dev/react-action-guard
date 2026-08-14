import { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { useDialogState } from "../core";
import { useNavigationBlocker } from "../react-router";
import {
  ActionButtons,
  ConfirmDialog,
  FormField,
  InfoBox,
  MockRouterProvider,
  NavigationSimulator,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Demonstrates async confirmation flow with a custom dialog.
 */

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const AsyncConfirmDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [note, setNote] = useState("");
  const { dialogState, confirm, onConfirm, onCancel } = useDialogState();

  const handleAsyncConfirm = async (message: string): Promise<boolean> => {
    const accepted = await confirm(message);
    if (!accepted) {
      return false;
    }

    setIsVerifying(true);
    await delay(1200);
    setIsVerifying(false);

    return true;
  };

  useNavigationBlocker({
    when: hasUnsavedChanges,
    message: "This draft has unsaved changes. Leave anyway?",
    onConfirm: handleAsyncConfirm,
    onBlock: () => {
      console.log("🚫 Navigation blocked - waiting for async confirmation");
    },
    onAllow: () => {
      console.log("✅ Navigation allowed after async confirmation");
    },
  });

  const isBlocking = hasUnsavedChanges || isVerifying;

  const handleChange = (value: string) => {
    setNote(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log("Saving:", note);
    setHasUnsavedChanges(false);
    alert("Draft saved!");
  };

  const handleDiscard = () => {
    setNote("");
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="Async Confirmation Demo">
      <InfoBox className="mb-20">
        <p>
          <strong>⏳ Async confirmation:</strong> After you confirm, we simulate a server-side check
          before allowing navigation. This mirrors real workflows (validation, cleanup, audit logs).
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={isBlocking}
        blockedMessage={
          isVerifying ? "⏳ Verifying confirmation..." : "🔒 Draft has unsaved changes"
        }
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">📝 Edit Draft</h3>
        <FormField
          label="Notes"
          type="textarea"
          value={note}
          placeholder="Write your draft notes..."
          rows={4}
          onChange={handleChange}
        />
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save Draft"
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>

      <div className="nav-section">
        <h4 className="nav-section-title">🧭 Test Navigation (Async flow):</h4>
        <div className="nav-links">
          <Link to="/drafts" className="btn btn-primary link-button">
            Go to Drafts
          </Link>
          <Link to="/archive" className="btn btn-primary link-button">
            Go to Archive
          </Link>
          <Link to="/settings" className="btn btn-primary link-button">
            Go to Settings
          </Link>
        </div>
      </div>

      <NavigationSimulator isBlocked={isBlocking} />

      {dialogState && (
        <ConfirmDialog
          title="Leave Draft?"
          message={dialogState.message}
          emphasis="We will verify your action before leaving."
          cancelLabel="Stay and Review"
          confirmLabel="Leave Anyway"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      )}

      <InfoBox className="mt-20">
        <p>
          <strong>💡 Why async?</strong> Some apps need extra time to finalize actions (save draft,
          release locks, invalidate caches). Async confirmation lets you block navigation until that
          work completes.
        </p>
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof AsyncConfirmDemo> = {
  title: "Examples/Async Confirmation",
  component: AsyncConfirmDemo,
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
          "Demonstrates **async confirmation** using a custom dialog. After user confirmation, " +
          "a simulated async step runs before navigation is allowed. Useful for validation, cleanup, " +
          "or server-side checks.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AsyncConfirmDemo>;

export const AsyncFlow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "⏳ **Async confirmation flow** - Custom dialog resolves, then an async verification " +
          "step runs before navigation proceeds.",
      },
    },
  },
};
