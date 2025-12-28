import { createStoreProvider } from "@okyrychenko-dev/react-zustand-toolkit";
import { type ReactNode } from "react";
import { type StoreApi } from "zustand";
import { createUIBlockingActions } from "../store/uiBlockingStore.actions";
import type { Middleware } from "../middleware";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

/**
 * Props for the {@link UIBlockingProvider} component.
 * 
 * Configures an isolated UI blocking store instance for a subtree of your app.
 * Useful for SSR, testing, micro-frontends, or any scenario where you need
 * independent blocking state.
 * 
 * @public
 * @since 0.6.0
 */
export interface UIBlockingProviderProps {
  children: ReactNode;
  /** Enable Redux DevTools integration (default: true in development) */
  enableDevtools?: boolean;
  /** Name for Redux DevTools (default: "UIBlocking") */
  devtoolsName?: string;
  /** Initial middlewares to register */
  middlewares?: ReadonlyArray<Middleware>;
}

/**
 * Base provider implementation created using toolkit's createStoreProvider.
 * @internal
 */
const {
  Provider: BaseUIBlockingProvider,
  useContext: useUIBlockingContext,
  useContextStore: useUIBlockingStoreFromContext,
  useIsInsideProvider: useIsInsideUIBlockingProvider,
  useOptionalContext,
} = createStoreProvider(createUIBlockingActions, "UIBlocking");

/**
 * Provider component for isolated UI blocking state management.
 * 
 * Creates an independent store instance for a subtree of your application.
 * Each provider has its own isolated blocking state, separate from the global
 * store and other provider instances.
 * 
 * **Use cases:**
 * - Server-Side Rendering (SSR) - Avoid state sharing between requests
 * - Testing - Isolated state for each test
 * - Micro-frontends - Independent blocking state per micro-app
 * - Modals/Dialogs - Scoped blocking within a dialog
 * 
 * Uses `createStoreProvider` from `@okyrychenko-dev/react-zustand-toolkit` with
 * built-in DevTools support and middleware registration.
 * 
 * @param props - Provider configuration
 * @param props.children - React children to wrap with the provider
 * @param props.enableDevtools - Enable Redux DevTools integration. Defaults to true in development, false in production.
 * @param props.devtoolsName - Name displayed in Redux DevTools. Defaults to "UIBlocking".
 * @param props.middlewares - Array of middleware functions to register on store creation
 * 
 * @example
 * Basic SSR setup
 * ```tsx
 * import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';
 * 
 * function App() {
 *   return (
 *     <UIBlockingProvider>
 *       <MyApplication />
 *     </UIBlockingProvider>
 *   );
 * }
 * ```
 * 
 * @example
 * With middleware and custom DevTools name
 * ```tsx
 * import { UIBlockingProvider, loggerMiddleware } from '@okyrychenko-dev/react-action-guard';
 * 
 * function App() {
 *   return (
 *     <UIBlockingProvider
 *       enableDevtools={true}
 *       devtoolsName="MyApp-UIBlocking"
 *       middlewares={[loggerMiddleware]}
 *     >
 *       <MyApplication />
 *     </UIBlockingProvider>
 *   );
 * }
 * ```
 * 
 * @example
 * Multiple providers for micro-frontends
 * ```tsx
 * function MicroFrontendApp() {
 *   return (
 *     <div>
 *       <UIBlockingProvider devtoolsName="MicroApp1">
 *         <MicroApp1 />
 *       </UIBlockingProvider>
 *       
 *       <UIBlockingProvider devtoolsName="MicroApp2">
 *         <MicroApp2 />
 *       </UIBlockingProvider>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * Testing with isolated state
 * ```tsx
 * // In your test file
 * import { render } from '@testing-library/react';
 * import { UIBlockingProvider } from '@okyrychenko-dev/react-action-guard';
 * 
 * test('blocker behavior', () => {
 *   render(
 *     <UIBlockingProvider enableDevtools={false}>
 *       <ComponentUnderTest />
 *     </UIBlockingProvider>
 *   );
 *   // Each test gets isolated state
 * });
 * ```
 * 
 * @see {@link useUIBlockingContext} to access the store from context
 * @see {@link useIsInsideUIBlockingProvider} to check if inside a provider
 * @see {@link UIBlockingProviderProps} for prop details
 * 
 * @public
 * @since 0.6.0
 */
export function UIBlockingProvider({
  children,
  enableDevtools = process.env.NODE_ENV === "development",
  devtoolsName = "UIBlocking",
  middlewares = [],
}: UIBlockingProviderProps): ReactNode {
  const handleStoreCreate = (store: StoreApi<UIBlockingStore>): void => {
    // Register initial middlewares
    middlewares.forEach((mw, index) => {
      store.getState().registerMiddleware(`provider-middleware-${index.toString()}`, mw);
    });
  };

  return (
    <BaseUIBlockingProvider
      enableDevtools={enableDevtools}
      devtoolsName={devtoolsName}
      onStoreCreate={handleStoreCreate}
    >
      {children}
    </BaseUIBlockingProvider>
  );
}


/**
 * Hook to access the store API from {@link UIBlockingProvider} context.
 * Returns the Zustand store API for the nearest UIBlockingProvider ancestor.
 * Throws an error if called outside a provider.
 * Use this when you need direct access to the store API (for subscribing,
 * getting state snapshots, etc.) rather than reactive hook access.
 * @returns Store API from the nearest UIBlockingProvider
 * @throws Error if called outside UIBlockingProvider
 * @example
 * Access store API in a component
 * ```tsx
 * function MyComponent() {
 *   const storeApi = useUIBlockingContext();
 *   useEffect(() => {
 *     // Subscribe to changes
 *     const unsubscribe = storeApi.subscribe((state) => {
 *       console.log('Blockers:', state.activeBlockers.size);
 *     });
 *     return unsubscribe;
 *   }, [storeApi]);
 *   return <div>...</div>;
 * }
 * ```
 * @see {@link useUIBlockingStoreFromContext} for reactive hook access
 * @see {@link UIBlockingProvider} for provider setup
 * @public
 * @since 0.6.0
 */

/**
 * Hook to access UI blocking store state from {@link UIBlockingProvider} context.
 * Works like {@link useUIBlockingStore} but uses the provider's isolated store
 * instead of the global store. Supports selective subscriptions for performance.
 * @returns Store state and actions from the nearest UIBlockingProvider
 * @throws Error if called outside UIBlockingProvider
 *
 * @example
 * Access full store
 * ```tsx
 * function MyComponent() {
 *   const store = useUIBlockingStoreFromContext();
 *
 *   return (
 *     <button onClick={() => store.addBlocker('test', { scope: 'form' })}>
 *       Add Blocker
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * Selective subscription (recommended)
 * ```tsx
 * function BlockerCount() {
 *   const count = useUIBlockingStoreFromContext(
 *     (state) => state.activeBlockers.size
 *   );
 *   return <div>{count} active blockers</div>;
 * }
 * ```
 * @see {@link useUIBlockingContext} for store API access
 * @see {@link UIBlockingProvider} for provider setup
 * @public
 * @since 0.6.0
 */

/**
 * Hook to check if the component is inside a {@link UIBlockingProvider}.
 * Returns true if the component is rendered within a UIBlockingProvider,
 * false otherwise. Useful for conditional logic or debugging.
 * @returns true if inside a UIBlockingProvider, false otherwise
 * @example
 * Conditional provider usage
 * ```tsx
 * function MyComponent() {
 *   const isInProvider = useIsInsideUIBlockingProvider();
 *   if (!isInProvider) {
 *     console.warn('Component rendered outside UIBlockingProvider');
 *   }
 *   return <div>In provider: {isInProvider ? 'Yes' : 'No'}</div>;
 * }
 * ```
 * @example
 * Debug helper
 * ```tsx
 * function DebugInfo() {
 *   const isInProvider = useIsInsideUIBlockingProvider();
 *   return (
 *     <div>
 *       <p>Provider status: {isInProvider ? '✅' : '❌'}</p>
 *     </div>
 *   );
 * }
 * ```
 * @see {@link UIBlockingProvider} for provider setup
 * @public
 * @since 0.6.0
 */

// Export hooks from base provider
export {
  useUIBlockingContext,
  useUIBlockingStoreFromContext,
  useIsInsideUIBlockingProvider,
  useOptionalContext,
};
