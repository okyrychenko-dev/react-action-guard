import type { BlockerConfig } from "@okyrychenko-dev/react-action-guard";

declare module "@okyrychenko-dev/react-action-guard" {
  interface UIBlockingStoreActions {
    updateBlocker: (id: string, config?: Partial<BlockerConfig>) => void;
  }
}
