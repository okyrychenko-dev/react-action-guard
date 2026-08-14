import { ReactElement } from "react";
import { InfoBox, StoryContainer } from "../storybook/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import "./components/shared.stories.css";

/**
 * Storybook introduction and concept overview.
 */

function Introduction(): ReactElement {
  return (
    <StoryContainer title="React Action Guard Router">
      <InfoBox className="mb-20">
        <p>
          <strong>🧭 What is this?</strong> A router integration layer for React Action Guard that
          blocks navigation when your app is in a protected state.
        </p>
      </InfoBox>

      <InfoBox className="mb-16">
        <h3 className="card-title">Core Concept</h3>
        <p>
          You define <strong>when navigation is blocked</strong> (local state or shared scope), and
          the router adapter handles:
        </p>
        <ul className="list">
          <li>Navigation blocking within the router</li>
          <li>Optional browser unload protection</li>
          <li>Sync or async confirmation flows</li>
        </ul>
      </InfoBox>

      <InfoBox className="card mb-16">
        <h3 className="card-title">Start Here</h3>
        <ul className="list">
          <li>
            <strong>Examples/Window Confirm Dialog</strong> for the simplest setup
          </li>
          <li>
            <strong>Examples/Custom Dialog</strong> for full UI control
          </li>
          <li>
            <strong>Examples/Async Confirmation</strong> for async checks
          </li>
          <li>
            <strong>Integration/Scope Synchronization</strong> for shared guard scopes
          </li>
          <li>
            <strong>Integration/Combined Blocking Sources</strong> to combine scope + local state
          </li>
        </ul>
      </InfoBox>

      <InfoBox>
        <h3 className="card-title">Router Adapters</h3>
        <p>Pick the adapter that matches your router:</p>
        <ul className="list">
          <li>React Router v6+</li>
          <li>TanStack Router</li>
          <li>Next.js Pages Router (recommended for blocking)</li>
          <li>Next.js App Router (limited blocking support)</li>
        </ul>
      </InfoBox>
    </StoryContainer>
  );
}

const meta: Meta<typeof Introduction> = {
  title: "Overview/Storybook Tour",
  component: Introduction,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "High-level introduction to react-action-guard-router and how to navigate the stories. " +
          "Start here to understand the core concept before diving into specific router adapters.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Introduction>;

export const Overview: Story = {};
