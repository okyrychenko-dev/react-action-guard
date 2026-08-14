import { ReactElement, useState } from "react";
// import { usePagesRouterBlocker } from '../nextjs'; // Not used in Storybook demo
import { useBeforeUnload, useDialogState } from "../core";
import {
  ActionButtons,
  CodeBlock,
  ConfirmDialog,
  FormField,
  InfoBox,
  NavigationSimulator,
  StatusDisplay,
  StoryContainer,
} from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "../storybook/components/shared.stories.css";

/**
 * Comprehensive Next.js Pages Router Demo
 * Note: In Storybook we can't fully mock Next.js router, but we show the API usage
 */

const NextPagesRouterDemo = (): ReactElement => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({ productName: "", price: "", description: "" });
  const { dialogState, onConfirm, onCancel } = useDialogState();

  // Note: In Storybook, we can't actually use Next.js router
  // This demo shows the API - in real Next.js app, uncomment this:
  /*
  usePagesRouterBlocker({
    when: hasUnsavedChanges,
    message: 'You have unsaved product changes. Are you sure you want to leave?',
    onConfirm: (msg) => {
      return confirm(msg);
    },
    onBlock: () => {
      console.log('🚫 Next.js Pages Router: Navigation blocked');
    },
    onAllow: () => {
      console.log('✅ Next.js Pages Router: Navigation allowed');
    },
  });
  */

  // For demo purposes, we log what would happen
  if (hasUnsavedChanges) {
    console.log("📝 Pages Router would block navigation if in real Next.js app");
  }

  // Browser unload protection
  useBeforeUnload(
    hasUnsavedChanges,
    "You have unsaved product changes. Are you sure you want to leave?"
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log("Saving product:", formData);
    setHasUnsavedChanges(false);
    alert("Product saved successfully!");
  };

  const handleDiscard = () => {
    setFormData({ productName: "", price: "", description: "" });
    setHasUnsavedChanges(false);
  };

  return (
    <StoryContainer title="Next.js Pages Router Integration Demo">
      <InfoBox className="mb-20">
        <p>
          <strong>⚛️ Next.js Pages Router Integration</strong>
        </p>
        <p>
          This demonstrates <code>usePagesRouterBlocker</code> API for{" "}
          <strong>Next.js Pages Router</strong>. Works with <code>next/router</code> and intercepts
          navigation events.
        </p>
      </InfoBox>

      <StatusDisplay
        isBlocked={hasUnsavedChanges}
        blockedMessage="🔒 Product has unsaved changes"
        readyMessage="✅ No unsaved changes"
      />

      <div className="card mt-20">
        <h3 className="card-title">🛍️ Edit Product</h3>
        <FormField
          label="Product Name"
          value={formData.productName}
          placeholder="Enter product name"
          onChange={(value: string) => {
            handleChange("productName", value);
          }}
        />
        <FormField
          label="Price"
          value={formData.price}
          placeholder="Enter price"
          onChange={(value: string) => {
            handleChange("price", value);
          }}
        />
        <FormField
          label="Description"
          type="textarea"
          value={formData.description}
          placeholder="Enter product description..."
          rows={4}
          onChange={(value: string) => {
            handleChange("description", value);
          }}
        />
        <ActionButtons
          disabled={!hasUnsavedChanges}
          saveLabel="💾 Save Product"
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      </div>

      {/* Custom Dialog */}
      {dialogState && (
        <ConfirmDialog
          title="Unsaved Product Changes"
          message="You have unsaved changes to this product."
          emphasis="Are you sure you want to leave?"
          cancelLabel="Continue Editing"
          confirmLabel="Leave Without Saving"
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      )}

      <NavigationSimulator isBlocked={hasUnsavedChanges} />

      <InfoBox className="mt-20">
        <p>
          <strong>💡 Features demonstrated:</strong>
        </p>
        <ul className="list">
          <li>
            ✅ Next.js Pages Router <code>router.events</code> interception
          </li>
          <li>
            ✅ Custom React dialog with <code>useDialogState</code>
          </li>
          <li>
            ✅ Browser refresh/close protection with <code>useBeforeUnload</code>
          </li>
          <li>✅ Async confirmation with navigation re-attempt</li>
        </ul>
        <CodeBlock
          title="📝 Usage in real Next.js app:"
          code={`import { usePagesRouterBlocker } from '@okyrychenko-dev/react-action-guard-router/nextjs';

function EditProduct() {
  const [hasChanges, setHasChanges] = useState(false);
  
  usePagesRouterBlocker({
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

const meta: Meta<typeof NextPagesRouterDemo> = {
  title: "Router Examples/Next.js Pages Router",
  component: NextPagesRouterDemo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "**Next.js Pages Router Integration** - Complete example showing navigation blocking " +
          "with Next.js Pages Router. Uses `router.events` to intercept navigation and supports " +
          "custom dialogs and browser protection. Works with Next.js 13.4+.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof NextPagesRouterDemo>;

export const ComprehensiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "🛍️ **Complete Next.js Pages Router Demo** - Shows custom dialog, browser protection, " +
          "and event-based navigation blocking. Try editing the product form!",
      },
    },
  },
};
