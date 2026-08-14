import { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { useBeforeUnload } from "../core";
import { useNavigationBlocker } from "../react-router";
import {
  ActionButtons,
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
 * Demonstrates window.confirm dialog for navigation blocking
 */

const WindowConfirmDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useNavigationBlocker({
    when: hasUnsavedChanges,
    message: "You have unsaved changes. Are you sure you want to leave?",
    onBlock: () => {
      console.log("🚫 Navigation blocked - showing window.confirm");
    },
    onAllow: () => {
      console.log("✅ User confirmed navigation");
    },
  });

  // Also protect from browser refresh/close
  useBeforeUnload(hasUnsavedChanges, "You have unsaved changes. Are you sure you want to leave?");

  const handleChange = (field: "name" | "email", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log("Saving:", formData);
    setHasUnsavedChanges(false);
    alert("Form saved!");
  };

  const handleDiscard = () => {
    setFormData({ name: "", email: "" });
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="Window.confirm Dialog Demo">
      <InfoBox className="mb-20">
        <p>
          <strong>📝 How it works:</strong> When you make changes to the form and try to navigate, a{" "}
          <strong>browser native window.confirm dialog</strong> will appear asking for confirmation.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={hasUnsavedChanges}
        blockedMessage="🔒 Form has unsaved changes"
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">Edit Profile</h3>
        <FormField
          label="Name"
          value={formData.name}
          placeholder="Enter your name"
          onChange={(value: string) => {
            handleChange("name", value);
          }}
        />
        <FormField
          label="Email"
          value={formData.email}
          placeholder="Enter your email"
          onChange={(value: string) => {
            handleChange("email", value);
          }}
        />
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save Changes"
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>

      {/* Real navigation links to trigger blocking */}
      <div className="nav-section">
        <h4 className="nav-section-title">🧭 Test Navigation (Click to trigger dialog):</h4>
        <div className="nav-links">
          <Link to="/home" className="btn btn-primary link-button">
            Go to Home
          </Link>
          <Link to="/about" className="btn btn-primary link-button">
            Go to About
          </Link>
          <Link to="/settings" className="btn btn-primary link-button">
            Go to Settings
          </Link>
        </div>
      </div>

      <NavigationSimulator isBlocked={hasUnsavedChanges} />

      <InfoBox className="mt-20">
        <p>
          <strong>💡 Try this:</strong>
        </p>
        <ol className="list">
          <li>Type something in the form fields</li>
          <li>Click one of the navigation buttons above</li>
          <li>A native browser dialog will appear!</li>
          <li>Click &quot;Cancel&quot; to stay, or &quot;OK&quot; to leave</li>
        </ol>
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof WindowConfirmDemo> = {
  title: "Examples/Window Confirm Dialog",
  component: WindowConfirmDemo,
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
          "Demonstrates navigation blocking with the **browser native window.confirm dialog**. " +
          "This is the simplest approach - no custom dialog needed. When the user tries to navigate " +
          "with unsaved changes, a standard confirmation dialog appears.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof WindowConfirmDemo>;

export const BasicForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "📝 **Edit Form with window.confirm** - Standard browser dialog for unsaved changes. " +
          "Simple and works everywhere, but cannot be styled.",
      },
    },
  },
};
