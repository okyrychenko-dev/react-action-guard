import { useBlocker } from "@okyrychenko-dev/react-action-guard";
import { clsx } from "clsx";
import { ReactElement, useEffect, useState } from "react";
import ActionGuardDevtools from "./ActionGuardDevtools";
import styles from "./ActionGuardDevtools.stories.module.css";
import { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ActionGuardDevtools> = {
  title: "Components/ActionGuardDevtools",
  component: ActionGuardDevtools,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["left", "right"],
      description: "Position of the devtools panel",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the panel is open by default",
    },
    maxEvents: {
      control: "number",
      description: "Maximum number of events to store",
    },
    showInProduction: {
      control: "boolean",
      description: "Show devtools in production",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Demo app component that creates blocking events
 */
function DemoApp(): ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Simulate loading blocker
  useBlocker(
    "demo-loading",
    {
      scope: "global",
      reason: "Loading data...",
      priority: 50,
    },
    isLoading
  );

  // Simulate saving blocker with higher priority
  useBlocker(
    "demo-saving",
    {
      scope: ["form", "navigation"],
      reason: "Saving changes...",
      priority: 100,
    },
    isSaving
  );

  // Simulate unsaved changes blocker
  useBlocker(
    "demo-unsaved",
    {
      scope: "navigation",
      reason: "You have unsaved changes",
      priority: 75,
    },
    hasUnsavedChanges
  );

  const handleLoad = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleSave = (): void => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }, 1500);
  };

  return (
    <div className={styles.demoApp}>
      <h1>Devtools Demo</h1>
      <p>Interact with the buttons below to trigger blocking events:</p>

      <div className={styles.buttonRow}>
        <button
          disabled={isLoading}
          className={clsx(
            styles.buttonBase,
            isLoading ? styles.buttonDisabled : styles.buttonInteractive
          )}
          onClick={handleLoad}
        >
          {isLoading ? "Loading..." : "Load Data"}
        </button>

        <button
          className={clsx(
            styles.buttonBase,
            styles.buttonInteractive,
            styles.actionButton,
            hasUnsavedChanges ? styles.unsavedActive : styles.unsavedInactive
          )}
          onClick={() => {
            setHasUnsavedChanges(!hasUnsavedChanges);
          }}
        >
          {hasUnsavedChanges ? "Mark as Saved" : "Make Changes"}
        </button>

        <button
          disabled={isSaving || !hasUnsavedChanges}
          className={clsx(
            styles.buttonBase,
            styles.actionButton,
            styles.saveButton,
            isSaving || !hasUnsavedChanges ? styles.buttonDisabled : styles.buttonInteractive,
            (isSaving || !hasUnsavedChanges) && styles.buttonDimmed
          )}
          onClick={handleSave}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className={styles.statusSection}>
        <h2>Status</h2>
        <ul>
          <li>Loading: {isLoading ? "✓ Active" : "✗ Inactive"}</li>
          <li>Saving: {isSaving ? "✓ Active" : "✗ Inactive"}</li>
          <li>Unsaved Changes: {hasUnsavedChanges ? "✓ Yes" : "✗ No"}</li>
        </ul>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: (args: ActionGuardDevtoolsProps) => (
    <>
      <DemoApp />
      <ActionGuardDevtools {...args} />
    </>
  ),
};

export const RightPosition: Story = {
  args: {
    position: "right",
    defaultOpen: true,
  },
  render: (args: ActionGuardDevtoolsProps) => (
    <>
      <DemoApp />
      <ActionGuardDevtools {...args} />
    </>
  ),
};

export const LeftPosition: Story = {
  args: {
    position: "left",
    defaultOpen: true,
  },
  render: (args: ActionGuardDevtoolsProps) => (
    <>
      <DemoApp />
      <ActionGuardDevtools {...args} />
    </>
  ),
};

export const CustomMaxEvents: Story = {
  args: {
    maxEvents: 10,
    defaultOpen: true,
  },
  render: (args: ActionGuardDevtoolsProps) => (
    <>
      <DemoApp />
      <ActionGuardDevtools {...args} />
    </>
  ),
};

/**
 * Demo app that automatically cycles blockers every 2 seconds
 */
function AutoCycleDemo(): ReactElement {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => (c + 1) % 3);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useBlocker("auto-cycle-1", { scope: "demo", reason: "First blocker" }, cycle === 0);
  useBlocker("auto-cycle-2", { scope: "demo", reason: "Second blocker" }, cycle === 1);
  useBlocker("auto-cycle-3", { scope: "demo", reason: "Third blocker" }, cycle === 2);

  return (
    <div className={styles.demoApp}>
      <h1>Auto Cycle Demo</h1>
      <p>Blockers are automatically cycling every 2 seconds.</p>
      <p>Current cycle: {cycle + 1}</p>
    </div>
  );
}

/**
 * Example with automatic blocker cycle
 */
export const AutoCycle: Story = {
  render: (args: ActionGuardDevtoolsProps) => (
    <>
      <AutoCycleDemo />
      <ActionGuardDevtools {...args} defaultOpen={true} />
    </>
  ),
};
