import { ReactElement } from "react";
import ActionGuardDevtoolsInternal from "./ActionGuardDevtoolsInternal";
import type { ActionGuardDevtoolsProps } from "./ActionGuardDevtools.types";
import "../../styles/theme.css";

/**
 * ActionGuardDevtools - Visual developer tools panel for debugging UI blocking.
 *
 * This component provides a floating developer tools panel that visualizes all UI blocking
 * events in real-time. It shows active blockers, their priorities, scopes, and provides
 * a timeline of all blocking events with filtering and search capabilities.
 *
 * **Key Features:**
 * - Real-time visualization of active blockers
 * - Timeline of blocking events (add, update, remove, timeout, clear, clear_scope)
 * - Filter by action type, scope, or search term
 * - Pause/resume event capture
 * - Keyboard shortcuts (Esc to close, Space to pause, C to clear)
 * - Works with both global store and custom store instances
 *
 * **Performance:**
 * - Automatically disabled in production builds (returns `null`)
 * - Only allocates resources in development
 * - Uses `showInProduction` prop to override if needed
 *
 * **Integration:**
 * - Automatically registers devtools middleware on mount
 * - Cleans up middleware on unmount
 * - No configuration required for basic usage
 *
 * @param props - Configuration props for the devtools panel
 * @param props.position - Panel position: 'left' | 'right' (default: 'right')
 * @param props.defaultOpen - Whether panel is open initially (default: false)
 * @param props.maxEvents - Maximum events to store in timeline (default: 200)
 * @param props.showInProduction - Show panel even in production (default: false)
 * @param props.store - Custom blocking store instance to observe (default: global store)
 *
 * @returns React element in development, `null` in production (unless `showInProduction` is true)
 *
 * @example
 * Basic usage (global store)
 * ```tsx
 * import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';
 *
 * function App() {
 *   return (
 *     <div>
 *       <YourApp />
 *       <ActionGuardDevtools />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * With custom configuration
 * ```tsx
 * <ActionGuardDevtools
 *   position="right"
 *   defaultOpen={true}
 *   maxEvents={500}
 * />
 * ```
 *
 * @example
 * With custom store instance
 * ```tsx
 * import { UIBlockingProvider, useUIBlockingContext } from '@okyrychenko-dev/react-action-guard';
 * import { ActionGuardDevtools } from '@okyrychenko-dev/react-action-guard-devtools';
 *
 * function DevtoolsWithProvider() {
 *   const store = useUIBlockingContext();
 *   return <ActionGuardDevtools store={store} />;
 * }
 *
 * function IsolatedApp() {
 *   return (
 *     <UIBlockingProvider>
 *       <YourApp />
 *       <DevtoolsWithProvider />
 *     </UIBlockingProvider>
 *   );
 * }
 * ```
 *
 * Note: the `store` prop switches the observed blocking store. Devtools instances observing the
 * same store share panel state and event history; instances observing different stores are
 * isolated.
 *
 * @example
 * Keyboard shortcuts
 * ```
 * Esc        - Close devtools panel
 * Space      - Toggle pause/resume event capture
 * C          - Clear all events
 * ```
 *
 * @see {@link https://github.com/okyrychenko-dev/react-action-guard-devtools | DevTools README}
 * @see {@link createDevtoolsMiddleware} for manual middleware registration
 *
 * @public
 */
function ActionGuardDevtools(props: ActionGuardDevtoolsProps): ReactElement | null {
  const { showInProduction = false, ...others } = props;

  // Early return in production - no hooks called, no resources allocated
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }

  return <ActionGuardDevtoolsInternal {...others} />;
}

export default ActionGuardDevtools;
