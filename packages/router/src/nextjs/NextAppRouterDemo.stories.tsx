import { ReactElement, useState } from "react";
// import { useAppRouterBlocker } from '../nextjs'; // Not used in Storybook demo
import { useBeforeUnload } from "../core";
import {
  ActionButtons,
  CodeBlock,
  FormField,
  InfoBox,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Next.js App Router Limitations Demo
 * Shows what works and what doesn't with App Router
 */

const NextAppRouterDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  // Note: In Storybook, we can't actually use Next.js App Router
  // This demo shows the API - in real Next.js app, uncomment this:
  /*
  useAppRouterBlocker({
    when: hasUnsavedChanges,
    message: 'You have unsaved changes. Are you sure you want to leave?',
  });
  */

  // For demo purposes only
  if (hasUnsavedChanges) {
    console.log("📝 App Router would attempt blocking if in real Next.js app");
  }

  // Browser unload protection (this DOES work)
  useBeforeUnload(hasUnsavedChanges, "You have unsaved changes. Are you sure you want to leave?");

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log("Saving:", formData);
    setHasUnsavedChanges(false);
    alert("Saved successfully!");
  };

  const handleDiscard = () => {
    setFormData({ title: "", content: "" });
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="Next.js App Router - Limitations Demo">
      <InfoBox className="warning-box mb-20">
        <p>
          <strong>⚠️ Next.js App Router Limitations</strong>
        </p>
        <p>App Router does NOT support navigation blocking. This is an API demonstration only.</p>
      </InfoBox>

      <StatusDisplay
        isBlocked={hasUnsavedChanges}
        blockedMessage="🔒 Has unsaved changes"
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">📝 Edit Note</h3>
        <FormField
          label="Title"
          value={formData.title}
          placeholder="Enter title"
          onChange={(value: string) => {
            handleChange("title", value);
          }}
        />
        <FormField
          label="Content"
          type="textarea"
          value={formData.content}
          placeholder="Write content..."
          rows={4}
          onChange={(value: string) => {
            handleChange("content", value);
          }}
        />
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save"
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>
      <div className="card mt-20 success-card">
        <h4 className="card-header-success">✅ What DOES Work:</h4>
        <ul className="list">
          <li>
            <strong>Browser close/refresh protection</strong> via <code>useBeforeUnload</code>
          </li>
          <li>Try Ctrl+R or closing tab - you will see a browser warning</li>
          <li>Best-effort client-side navigation blocking</li>
        </ul>
      </div>

      {/* What Doesn't Work */}
      <InfoBox className="mt-20">
        <p>
          <strong>💡 Why App Router is limited:</strong>
        </p>
        <ul className="list">
          <li>
            ❌ No <code>router.events</code> API
          </li>
          <li>
            ❌ No way to intercept <code>Link</code> clicks
          </li>
          <li>✅ Only browser unload protection works</li>
        </ul>
        <p className="mt-20">
          <strong>💡 Recommendation:</strong>
        </p>
        <p>
          For apps requiring reliable navigation blocking, consider using{" "}
          <strong>Pages Router</strong> instead of App Router. Or implement form state management
          that survives navigation (e.g., session storage).
        </p>
        <CodeBlock
          title="📝 Usage in real Next.js App Router:"
          code={`'use client';

import { useAppRouterBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';

export default function MyComponent() {
  const [hasChanges, setHasChanges] = useState(false);
  
  useAppRouterBlocker({
    when: hasChanges,
    message: 'Leave page?',
  });
  
  // Provides browser protection only
}`}
        />
      </InfoBox>
    </StoryContainer>
  );
};

const meta: Meta<typeof NextAppRouterDemo> = {
  title: "Router Examples/Next.js App Router",
  component: NextAppRouterDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**Next.js App Router - Limitations Demo** - Shows the limitations of navigation blocking " +
          "in Next.js App Router. While `useBeforeUnload` works for browser protection, client-side " +
          "navigation blocking is limited due to App Router architecture. Use Pages Router for reliable blocking.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof NextAppRouterDemo>;

export const LimitationsDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "⚠️ **App Router Limitations** - Demonstrates what works (browser protection) and " +
          "what does not (reliable navigation blocking). Honest about the constraints!",
      },
    },
  },
};
