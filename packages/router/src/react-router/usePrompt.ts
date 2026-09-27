import { useNavigationBlocker } from "./useNavigationBlocker";
import type { UsePromptOptions } from "./types";

/**
 * Simple prompt API similar to React Router v5's `usePrompt`.
 */
export function usePrompt(message: string, when: boolean | (() => boolean)): void {
  useNavigationBlocker({
    when,
    message,
    blockBrowserUnload: true,
  });
}

/**
 * Hook variant that accepts options object
 *
 * @param options - Prompt configuration
 *
 * @example
 * ```tsx
 * usePromptWithOptions({
 *   message: 'Leave without saving?',
 *   when: hasChanges
 * });
 * ```
 */
export function usePromptWithOptions(options: UsePromptOptions): void {
  useNavigationBlocker({
    ...options,
    blockBrowserUnload: options.blockBrowserUnload ?? true,
  });
}
