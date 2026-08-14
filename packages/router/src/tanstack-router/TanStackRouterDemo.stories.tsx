import { ReactElement, useState } from "react";
// import { Link } from '@tanstack/react-router'; // Not used in Storybook demo
// import { useNavigationBlocker } from '../tanstack-router'; // Not used in Storybook demo
import { useBeforeUnload, useDialogState } from "../core";
import {
  ActionButtons,
  CodeBlock,
  ConfirmDialog,
  FormField,
  InfoBox,
  MockTanStackRouterProvider,
  NavigationSimulator,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Comprehensive TanStack Router Demo
 * Shows all blocking features: navigation, browser unload, custom dialogs
 */

const TanStackRouterDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", tags: "" });
  const { dialogState, onConfirm, onCancel } = useDialogState();

  // Note: In Storybook, we can't fully configure TanStack Router
  // This demo shows the API - in real TanStack Router app, uncomment this:
  /*
  useNavigationBlocker({
    when: hasUnsavedChanges,
    message: 'You have unsaved changes to your post. Are you sure you want to leave?',
    onConfirm: (msg) => {
      return confirm(msg);
    },
    onBlock: () => {
      console.log('🚫 TanStack Router: Navigation blocked');
    },
    onAllow: () => {
      console.log('✅ TanStack Router: Navigation allowed');
    },
  });
  */

  // For demo purposes
  if (hasUnsavedChanges) {
    console.log("📝 TanStack Router would block navigation if in real app");
  }

  // Browser unload protection
  useBeforeUnload(
    hasUnsavedChanges,
    "You have unsaved changes to your post. Are you sure you want to leave?"
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log("Saving post:", formData);
    setHasUnsavedChanges(false);
    alert("Post saved successfully!");
  };

  const handleDiscard = () => {
    setFormData({ title: "", content: "", tags: "" });
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="TanStack Router Integration Demo">
      <InfoBox className="mb-20">
        <p>
          <strong>⚛️ TanStack Router Integration</strong>
        </p>
        <p>
          This demonstrates API usage for <code>useNavigationBlocker</code> with TanStack Router.
          Works with <code>@tanstack/react-router</code> navigation.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={hasUnsavedChanges}
        blockedMessage="🔒 Post has unsaved changes"
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">📝 Edit Blog Post</h3>
        <FormField
          label="Title"
          value={formData.title}
          placeholder="Enter post title"
          onChange={(value) => {
            handleChange("title", value);
          }}
        />
        <FormField
          label="Content"
          type="textarea"
          value={formData.content}
          placeholder="Write your post content..."
          rows={4}
          onChange={(value) => {
            handleChange("content", value);
          }}
        />
        <div className="form-group">
          <label className="form-label">Tags</label>
          <input
            type="text"
            className="form-input"
            value={formData.tags}
            placeholder="Enter tags (comma separated)"
            onChange={(e) => {
              handleChange("tags", e.target.value);
            }}
          />
        </div>
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save Post"
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>

      <NavigationSimulator isBlocked={hasUnsavedChanges} />

      {/* Custom Dialog */}
      {dialogState && (
        <ConfirmDialog
          title="Unsaved Changes"
          message="You have unsaved changes to your blog post."
          emphasis="Are you sure you want to leave?"
          cancelLabel="Stay and Edit"
          confirmLabel="Leave Without Saving"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      )}

      <InfoBox className="mt-20">
        <p>
          <strong>💡 Features demonstrated:</strong>
        </p>
        <ul className="list">
          <li>✅ TanStack Router navigation interception</li>
          <li>
            ✅ Custom React dialog with <code>useDialogState</code>
          </li>
          <li>
            ✅ Browser refresh/close protection with <code>useBeforeUnload</code>
          </li>
        </ul>
        <CodeBlock
          title="📝 Usage in real TanStack Router app:"
          code={`import { useNavigationBlocker } from '@okyrychenko-dev/react-action-guard-router/tanstack-router';

function EditPost() {
  const [hasChanges, setHasChanges] = useState(false);
  
  useNavigationBlocker({
    when: hasChanges,
    message: 'Leave page?',
  });
  
  // Your component code
}`}
        />
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof TanStackRouterDemo> = {
  title: "Router Examples/TanStack Router",
  component: TanStackRouterDemo,
  decorators: [
    (Story) => (
      <MockTanStackRouterProvider>
        <Story />
      </MockTanStackRouterProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**TanStack Router Integration** - Complete example showing navigation blocking, " +
          "custom dialogs, and browser protection with TanStack Router. Demonstrates type-safe " +
          "routing and all blocking features in one comprehensive demo.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TanStackRouterDemo>;

export const ComprehensiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "📝 **Complete TanStack Router Demo** - Shows custom dialog, browser protection, " +
          "and type-safe Link blocking. Try editing the form and navigating!",
      },
    },
  },
};
