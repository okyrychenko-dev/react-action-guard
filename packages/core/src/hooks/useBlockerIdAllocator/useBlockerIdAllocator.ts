import { useCallback } from "react";
import { useResolvedStoreApi } from "../../context";
import { allocateBlockerId } from "../../store/blockerId.utils";

export function useBlockerIdAllocator(): (prefix: string) => string {
  const store = useResolvedStoreApi();

  return useCallback((prefix: string): string => allocateBlockerId(store, prefix), [store]);
}
