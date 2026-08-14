import { useBlocker, useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { ReactElement, useState } from "react";
import { useNavigationBlocker } from "../react-router";
import {
  InfoBox,
  MockRouterProvider,
  NavigationSimulator,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Demonstrates combining local conditions with shared scopes.
 */

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const CombinedSourcesDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isUploadBlocked = useIsBlocked("upload");

  useBlocker(
    "upload-processing",
    {
      scope: "upload",
      reason: "Uploading attachments...",
      priority: 80,
    },
    isUploading
  );

  useNavigationBlocker({
    when: hasUnsavedChanges,
    scope: "upload",
    message: "Changes or uploads are in progress. Leave anyway?",
    onBlock: () => {
      console.log("🚫 Navigation blocked by condition or scope");
    },
    onAllow: () => {
      console.log("✅ Navigation allowed after all blockers cleared");
    },
  });

  const isBlocking = hasUnsavedChanges || isUploadBlocked;

  const startUpload = async () => {
    setIsUploading(true);
    await delay(2000);
    setIsUploading(false);
  };

  return (
    <StoryContainer title="Combined Blocking Sources">
      <InfoBox className="mb-20">
        <p>
          <strong>🧩 Two sources, one guard:</strong> This demo combines a local condition (unsaved
          changes) with a shared scope (upload). Either source activates blocking.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={isBlocking}
        blockedMessage={
          isBlocking ? (
            <span>
              🔒 Blocking active {hasUnsavedChanges && <span>(unsaved changes)</span>}
              {isUploadBlocked && <span>(upload in progress)</span>}
            </span>
          ) : (
            "✅ Ready to navigate"
          )
        }
        readyMessage="✅ Ready to navigate"
      />

      <div className="card mt-20">
        <h3 className="card-title">🧪 Toggle Sources</h3>
        <div className="form-group">
          <label className="form-label">
            <input
              type="checkbox"
              checked={hasUnsavedChanges}
              onChange={(e) => {
                setHasUnsavedChanges(e.target.checked);
              }}
              className="checkbox-label"
            />
            Mark form as dirty (local condition)
          </label>
        </div>
        <div className="action-area">
          <button
            onClick={() => {
              void startUpload();
            }}
            className="btn btn-primary"
            disabled={isUploading}
          >
            {isUploading ? "⏳ Uploading..." : "📤 Start Upload (scope)"}
          </button>
          <button
            onClick={() => {
              setIsUploading(false);
            }}
            className="btn btn-danger"
            disabled={!isUploading}
          >
            ❌ Cancel Upload
          </button>
        </div>
      </div>

      <NavigationSimulator isBlocked={isBlocking} />

      <InfoBox className="mt-20">
        <p>
          <strong>Why it matters:</strong> You can enforce navigation rules with local UI state and
          shared global scopes at the same time, without duplicating guard logic.
        </p>
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof CombinedSourcesDemo> = {
  title: "Integration/Combined Blocking Sources",
  component: CombinedSourcesDemo,
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
          "Shows how `useNavigationBlocker` can combine a **local condition** and a **shared scope**. " +
          "Navigation is blocked if either source is active, keeping rules centralized and predictable.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CombinedSourcesDemo>;

export const CombinedSources: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "🧩 **Combined sources** - Toggle unsaved changes and trigger an upload to see how both " +
          "sources contribute to the same navigation guard.",
      },
    },
  },
};
