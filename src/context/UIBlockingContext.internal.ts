import { createContext } from "react";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";
import type { StoreApi } from "zustand";

/**
 * Internal context - exported separately to avoid circular dependencies
 * Use UIBlockingContext.tsx for the public API
 */
export const UIBlockingContext = createContext<StoreApi<UIBlockingStore> | null>(null);
