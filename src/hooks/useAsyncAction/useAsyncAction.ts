import { useCallback, useRef } from "react";
import { useResolvedStoreWithSelector } from "../../context";
import { ASYNC_ACTION_PRIORITY } from "../../store";

/**
 * Options for useAsyncAction hook
 */
export interface UseAsyncActionOptions {
  /** Timeout in milliseconds after which the blocker will be automatically removed */
  timeout?: number;
  /** Callback invoked when the blocker is automatically removed due to timeout */
  onTimeout?: (blockerId: string) => void;
}

/**
 * Wraps async functions with automatic UI blocking during execution.
 * 
 * Creates a wrapper function that automatically:
 * 1. Adds a blocker before executing the async function
 * 2. Executes the async function
 * 3. Removes the blocker after completion (success or failure)
 * 
 * Each invocation generates a unique blocker ID (actionId-counter), allowing
 * multiple concurrent executions of the same action without ID conflicts.
 * The blocker is removed even if the async function throws an error.
 * 
 * Works with both the global store and isolated provider instances (via UIBlockingProvider).
 * 
 * @template T - The return type of the async function being wrapped
 * @param actionId - Base identifier for the action. Used in blocker ID and default reason.
 *                   Example: "saveForm", "fetchData", "submitOrder"
 * @param scope - Scope(s) to block during execution. Can be a single scope or array.
 *                Defaults to "global" if not specified.
 * @param options - Optional configuration
 * @param options.timeout - Timeout in milliseconds. Blocker auto-removes after this duration.
 * @param options.onTimeout - Callback invoked when blocker times out before async completes
 * 
 * @returns Wrapper function that accepts an async function and returns a Promise with the same type
 * 
 * @example
 * Basic form submission
 * ```tsx
 * function MyForm() {
 *   const executeWithBlocking = useAsyncAction('saveForm', 'form');
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     
 *     await executeWithBlocking(async () => {
 *       const response = await fetch('/api/save', {
 *         method: 'POST',
 *         body: JSON.stringify(formData)
 *       });
 *       return response.json();
 *     });
 *     
 *     alert('Form saved!');
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 * 
 * @example
 * With timeout and error handling
 * ```tsx
 * const executeWithBlocking = useAsyncAction(
 *   'fetchData',
 *   ['global', 'data'],
 *   {
 *     timeout: 30000, // 30 seconds
 *     onTimeout: (blockerId) => {
 *       console.warn(`Operation ${blockerId} timed out`);
 *     }
 *   }
 * );
 * 
 * const loadData = async () => {
 *   try {
 *     const data = await executeWithBlocking(async () => {
 *       return await fetchDataFromAPI();
 *     });
 *     setData(data);
 *   } catch (error) {
 *     console.error('Failed to load data:', error);
 *     // Blocker is automatically removed even on error
 *   }
 * };
 * ```
 * 
 * @example
 * Multiple concurrent actions
 * ```tsx
 * function FileUploader() {
 *   const uploadWithBlocking = useAsyncAction('upload', 'uploads');
 *   
 *   const uploadFiles = async (files) => {
 *     // Each upload gets unique blocker ID (upload-1, upload-2, etc.)
 *     const promises = files.map(file =>
 *       uploadWithBlocking(() => uploadFile(file))
 *     );
 *     
 *     await Promise.all(promises);
 *   };
 *   
 *   return <...>;
 * }
 * ```
 * 
 * @example
 * Type-safe return value
 * ```tsx
 * interface UserData {
 *   id: string;
 *   name: string;
 * }
 * 
 * function UserProfile() {
 *   const executeWithBlocking = useAsyncAction<UserData>('fetchUser', 'user');
 *   
 *   const loadUser = async (userId: string) => {
 *     const userData = await executeWithBlocking(async () => {
 *       const response = await fetch(`/api/users/${userId}`);
 *       return response.json(); // TypeScript knows this is UserData
 *     });
 *     
 *     // userData is typed as UserData
 *     console.log(userData.name);
 *   };
 *   
 *   return <...>;
 * }
 * ```
 * 
 * @see {@link useBlocker} for manual blocker management
 * @see {@link useIsBlocked} to check blocking state
 * @see {@link UseAsyncActionOptions} for available options
 * 
 * @public
 * @since 0.6.0
 */
export const useAsyncAction = <T = unknown>(
  actionId: string,
  scope?: string | ReadonlyArray<string>,
  options?: UseAsyncActionOptions
): ((asyncFn: () => Promise<T>) => Promise<T>) => {
  const { addBlocker, removeBlocker } = useResolvedStoreWithSelector((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));

  // Use counter instead of Date.now() to guarantee unique IDs even for rapid calls
  const counterRef = useRef(0);

  const executeWithBlocking = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T> => {
      counterRef.current += 1;
      const blockerId = `${actionId}-${String(counterRef.current)}`;

      try {
        addBlocker(blockerId, {
          scope,
          reason: `Executing ${actionId}`,
          priority: ASYNC_ACTION_PRIORITY,
          timeout: options?.timeout,
          onTimeout: options?.onTimeout,
        });

        return await asyncFn();
      } finally {
        removeBlocker(blockerId);
      }
    },
    [actionId, scope, options?.timeout, options?.onTimeout, addBlocker, removeBlocker]
  );

  return executeWithBlocking;
};
