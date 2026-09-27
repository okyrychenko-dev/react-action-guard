import { createContext } from "react";
import type { Nullable } from "@okyrychenko-dev/type-utils";
import type { StoreApi } from "zustand";
import type { UIBlockingStore } from "../store/uiBlockingStore.types";

/**
 * Internal context - exported separately to avoid circular dependencies
 * Use UIBlockingContext.tsx for the public API
 */
export const UIBlockingContext = createContext<Nullable<StoreApi<UIBlockingStore>>>(null);
