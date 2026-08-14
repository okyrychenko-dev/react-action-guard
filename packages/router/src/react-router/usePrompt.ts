import { useNavigationBlocker } from "./useNavigationBlocker";
import type { UsePromptOptions } from "./types";

/**
 * Simple prompt API similar to React Router v5's `usePrompt`.
 *
 * Shows a confirmation dialog when the user tries to navigate away
 * while the condition is true.
 *
 * This is a simpler API compared to `useNavigationBlocker` for cases
 * where you just want to show a prompt without advanced configuration.
 *
 * @param message - Message to show in confirmation dialog
 * @param when - Condition to determine when to show the prompt
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 *
 *   usePrompt(
 *     'You have unsaved changes. Are you sure you want to leave?',
 *     hasUnsavedChanges
 *   );
 *
 *   return <form>...</form>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With function condition
 * function EditPage() {
 *   const isDirty = useFormDirty();
 *
 *   usePrompt('Discard unsaved changes?', () => isDirty);
 * }
 * ```
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
