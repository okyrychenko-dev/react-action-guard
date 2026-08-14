import { ReactElement, useState } from "react";
import { Link } from "react-router-dom";
import { useBeforeUnload } from "../core";
import { usePrompt } from "../react-router";
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
 * Demonstrates the simple usePrompt API.
 */

const UsePromptDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [note, setNote] = useState("");

  usePrompt("You have unsaved changes. Leave anyway?", hasUnsavedChanges);
  useBeforeUnload(hasUnsavedChanges, "You have unsaved changes. Leave anyway?");

  const handleChange = (value: string) => {
    setNote(value);
    setHasUnsavedChanges(true);
  };

  const handleSave = (note: string) => () => {
    console.log("Saving:", note);
    setHasUnsavedChanges(false);
    alert("Note saved!");
  };

  const handleDiscard = () => {
    setNote("");
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="usePrompt Demo">
      <InfoBox className="mb-20">
        <p>
          <strong>🧩 Simple API:</strong> <code>usePrompt</code> mirrors the classic React Router
          prompt API. It is the quickest way to add navigation blocking.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={hasUnsavedChanges}
        blockedMessage="🔒 Unsaved changes"
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">✍️ Quick Note</h3>
        <FormField
          label="Note"
          type="textarea"
          value={note}
          placeholder="Write a quick note..."
          rows={3}
          onChange={handleChange}
        />
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save Note"
          onSave={handleSave(note)}
          onDiscard={handleDiscard}
        />
      </div>

      <div className="nav-section">
        <h4 className="nav-section-title">🧭 Test Navigation (usePrompt):</h4>
        <div className="nav-links">
          <Link to="/notes" className="btn btn-primary link-button">
            Go to Notes
          </Link>
          <Link to="/archive" className="btn btn-primary link-button">
            Go to Archive
          </Link>
          <Link to="/settings" className="btn btn-primary link-button">
            Go to Settings
          </Link>
        </div>
      </div>

      <NavigationSimulator isBlocked={hasUnsavedChanges} />
    </StoryContainer>
  );
};

const meta: Meta<typeof UsePromptDemo> = {
  title: "Examples/usePrompt",
  component: UsePromptDemo,
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
          "Shows the **usePrompt** API as a minimal wrapper around navigation blocking. " +
          "Ideal for teams migrating from React Router v5 prompt patterns.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UsePromptDemo>;

export const BasicPrompt: Story = {
  parameters: {
    docs: {
      description: {
        story: "🧩 **Simple prompt** - The minimal API for blocking when you have unsaved changes.",
      },
    },
  },
};
