import { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { useBeforeUnload, useDialogState } from "../core";
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
 * Demonstrates custom confirmation dialog with useDialogState
 */

const CustomDialogDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const { dialogState, confirm, onConfirm, onCancel } = useDialogState();

  useNavigationBlocker({
    when: hasUnsavedChanges,
    message: "You have unsaved changes to your article. Are you sure you want to leave?",
    onConfirm: (msg) => {
      // Show our custom dialog
      return confirm(msg);
    },
    onBlock: () => {
      console.log("🚫 Navigation blocked - showing custom dialog");
    },
    onAllow: () => {
      console.log("✅ User confirmed navigation via custom dialog");
    },
  });

  // Also protect from browser refresh/close
  useBeforeUnload(
    hasUnsavedChanges,
    "You have unsaved changes to your article. Are you sure you want to leave?"
  );

  const handleChange = (field: "title" | "content", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log("Saving:", formData);
    setHasUnsavedChanges(false);
    alert("Article saved!");
  };

  const handleDiscard = () => {
    setFormData({ title: "", content: "" });
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="Custom Dialog Demo">
      <InfoBox className="mb-20">
        <p>
          <strong>✨ How it works:</strong> This demo uses <code>useDialogState</code> to show a{" "}
          <strong>beautiful custom React dialog</strong> instead of window.confirm. Fully
          customizable!
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={hasUnsavedChanges}
        blockedMessage="🔒 Article has unsaved changes"
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">📄 Edit Article</h3>
        <FormField
          label="Title"
          value={formData.title}
          placeholder="Enter article title"
          onChange={(value: string) => {
            handleChange("title", value);
          }}
        />
        <FormField
          label="Content"
          type="textarea"
          value={formData.content}
          placeholder="Write your article content..."
          rows={4}
          onChange={(value: string) => {
            handleChange("content", value);
          }}
        />
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save Article"
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>

      {/* Real navigation links to trigger blocking */}
      <div className="nav-section">
        <h4 className="nav-section-title">🧭 Test Navigation (Click to see custom dialog):</h4>
        <div className="nav-links">
          <Link to="/dashboard" className="btn btn-primary link-button">
            Go to Dashboard
          </Link>
          <Link to="/articles" className="btn btn-primary link-button">
            Go to Articles
          </Link>
          <Link to="/profile" className="btn btn-primary link-button">
            Go to Profile
          </Link>
        </div>
      </div>

      <NavigationSimulator isBlocked={hasUnsavedChanges} />

      {/* Custom Dialog */}
      {dialogState && (
        <ConfirmDialog
          title="Unsaved Changes"
          message="You have unsaved changes to your article."
          emphasis="Are you sure you want to leave?"
          cancelLabel="Stay on Page"
          confirmLabel="Leave Anyway"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      )}

      <InfoBox className="mt-20">
        <p>
          <strong>💡 Try this:</strong>
        </p>
        <ol className="list">
          <li>Type something in the Title or Content fields</li>
          <li>Click one of the &quot;Go to...&quot; navigation buttons above</li>
          <li>A custom styled dialog will appear! (NOT window.confirm)</li>
          <li>Click &quot;Stay on Page&quot; to cancel or &quot;Leave Anyway&quot; to navigate</li>
        </ol>
        <p className="mt-20">
          <strong>✨ Notice the difference from window.confirm:</strong>
        </p>
        <ul className="list">
          <li>✨ Beautiful custom styled dialog with animation</li>
          <li>🎨 Fully customizable design matching your brand</li>
          <li>📱 Works great on mobile devices</li>
          <li>🎯 Better UX than native browser dialogs</li>
        </ul>
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof CustomDialogDemo> = {
  title: "Examples/Custom Dialog",
  component: CustomDialogDemo,
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
          "Demonstrates navigation blocking with a **custom React confirmation dialog** using `useDialogState`. " +
          "This approach gives you full control over the dialog appearance and behavior. " +
          "Perfect for maintaining brand consistency and creating better UX.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CustomDialogDemo>;

export const ArticleEditor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "📄 **Article Editor with Custom Dialog** - Shows a beautiful custom confirmation dialog. " +
          "Much better UX than window.confirm!",
      },
    },
  },
};
