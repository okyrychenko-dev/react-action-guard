/**
 * Core types for navigation blocking functionality
 */

/**
 * Base configuration for navigation blocking
 */
export interface BaseNavigationBlockerOptions {
  /**
   * Condition to determine if blocking should be active
   * Can be a boolean value or a function that returns a boolean
   */
  when?: boolean | (() => boolean);

  /**
   * Scope(s) from react-action-guard to check for blocking
   * When specified, navigation is blocked if any of these scopes are currently blocked
   */
  scope?: string | Array<string>;

  /**
   * Message to show in confirmation dialog
   * @default "Are you sure you want to leave? Changes you made may not be saved."
   */
  message?: string;

  /**
   * Callback when navigation is blocked
   */
  onBlock?: () => void;

  /**
   * Callback when navigation is allowed
   */
  onAllow?: () => void;

  /**
   * Whether to also block browser unload events (tab close, refresh)
   * @default true
   */
  blockBrowserUnload?: boolean;

  /**
   * Custom confirmation handler for showing your own dialog UI.
   *
   * If provided, this will be called instead of window.confirm() to allow
   * custom dialog components. Async handlers are supported, but note:
   * - Next.js Pages Router re-attempts navigation after resolve.
   * - Router adapters may ignore stale resolves if a newer confirm starts.
   *
   * @param message - The confirmation message to display
   * @returns boolean | Promise<boolean> - true to allow navigation, false to block
   *
   * @example
   * ```tsx
   * // With custom dialog component
   * const [dialogState, setDialogState] = useState(null);
   *
   * onConfirm: (message) => {
   *   return new Promise((resolve) => {
   *     setDialogState({ message, resolve });
   *   });
   * }
   *
   * // In JSX:
   * {dialogState && (
   *   <CustomDialog
   *     message={dialogState.message}
   *     onConfirm={() => {
   *       dialogState.resolve(true);
   *       setDialogState(null);
   *     }}
   *     onCancel={() => {
   *       dialogState.resolve(false);
   *       setDialogState(null);
   *     }}
   *   />
   * )}
   * ```
   */
  onConfirm?: (message: string) => boolean | PromiseLike<boolean>;
}

/**
 * Configuration for browser beforeunload event
 */
export interface BeforeUnloadOptions {
  /**
   * Condition to determine if blocking should be active
   */
  when: boolean | (() => boolean);

  /**
   * Custom message (may be ignored by modern browsers)
   * @default "Changes you made may not be saved."
   */
  message?: string;
}

/**
 * Return type for navigation blocker hooks
 */
export interface NavigationBlockerReturn {
  /**
   * Whether the blocking condition is currently active.
   */
  isBlocking: boolean;

  /**
   * Whether navigation is currently being intercepted.
   * Only available for adapters that can observe active interception state.
   */
  isIntercepting?: boolean;
}
