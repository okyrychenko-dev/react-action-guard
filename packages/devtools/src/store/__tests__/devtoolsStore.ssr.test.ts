/** @vitest-environment node */

import { createDevtoolsStoreBindings } from "@devtools/store";
import { describe, expect, it } from "vitest";

describe("devtoolsStore SSR persistence", () => {
  it("should write and clear preferences without browser storage", () => {
    const { store } = createDevtoolsStoreBindings();
    const { setActiveTab } = store.getState();

    setActiveTab("stats");
    store.persist.clearStorage();

    const { activeTab } = store.getState();

    expect(activeTab).toBe("stats");
  });
});
