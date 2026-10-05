import "@testing-library/jest-dom/vitest";
import { configureMiddleware, uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  const { clearAllBlockers } = uiBlockingStoreApi.getState();
  clearAllBlockers();
  configureMiddleware([]);
});
