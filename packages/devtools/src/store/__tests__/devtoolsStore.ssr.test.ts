/** @vitest-environment node */

import { describe, expect, it } from "vitest";
import { createDevtoolsStoreBindings } from "..";

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
