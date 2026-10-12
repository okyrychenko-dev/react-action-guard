import { assertDefined } from "@okyrychenko-dev/type-utils";
import { expect, test } from "@playwright/test";

for (const width of [390, 820, 1440]) {
  test(`agent and inspector explain shared scope protection at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/checkout");
    const workspace = page.getByRole("region", { name: "User and agent coordination" });
    await workspace.getByRole("button", { name: "Start agent edit" }).click();
    await expect(workspace.getByRole("textbox", { name: "Property value" })).toBeDisabled();
    await expect(workspace.getByRole("button", { name: "Save revision" })).toBeDisabled();
    await workspace.getByRole("button", { name: "Help and chat" }).click();
    await expect(workspace.getByText(/Read-only help remains available/)).toBeVisible();
    await page.getByTitle("Open Action Guard Devtools", { exact: true }).click();
    await page.getByRole("button", { name: "Active Blockers" }).click();
    const activeBlockersTab = page.getByRole("button", { name: "Active Blockers" });
    const tabBounds = await activeBlockersTab.boundingBox();
    expect(tabBounds).not.toBeNull();
    if (tabBounds) {
      expect(tabBounds.x).toBeGreaterThanOrEqual(0);
      expect(tabBounds.x + tabBounds.width).toBeLessThanOrEqual(width);
      expect(tabBounds.y).toBeLessThan(120);
    }
    const table = page.getByRole("table", { name: "Scope protection" });
    await expect(table.getByRole("row", { name: /^property / })).toContainText("Blocked");
    await expect(table.getByRole("row", { name: /^help / })).toContainText("Unaffected");
    await expect(
      page.getByText("Agent is editing property and recalculating revision", { exact: true }).last()
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({ path: `.cache/browser/agent-inspector-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await workspace.getByRole("button", { name: "Fail operation" }).click();
    await expect(workspace.getByRole("textbox", { name: "Property value" })).toHaveValue(
      "Original property"
    );
    await workspace.getByRole("button", { name: "Recalculate manually" }).click();
    await expect(workspace.getByRole("button", { name: "Start agent edit" })).toBeDisabled();
    await workspace.getByRole("button", { name: "Complete operation" }).click();
    await expect(workspace.getByText("Revision: 2", { exact: true })).toBeVisible();
    await workspace.getByRole("button", { name: "Start agent edit" }).click();
    await workspace.getByRole("button", { name: "Complete operation" }).click();
    await expect(workspace.getByRole("textbox", { name: "Property value" })).toHaveValue(
      "Agent proposal"
    );
    await page.getByRole("button", { name: "Reset demo" }).click();
    await expect(workspace.getByRole("button", { name: "Start agent edit" })).toBeEnabled();
    await expect(workspace.getByRole("textbox", { name: "Property value" })).toHaveValue(
      "Original property"
    );
  });
}

test("autosave retains cancellation and allows navigation after settlement", async ({ page }) => {
  await page.goto("/checkout");
  await page.getByRole("textbox", { name: "Shipping address" }).fill("Browser autosave address");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByRole("button", { name: /^admin/i }).click();
  await page.getByRole("button", { name: "Stay and save" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole("checkbox", { name: "Autosave checkout" }).check();
  await expect(page.getByText("Navigation open", { exact: true })).toBeVisible();
  await navigation.getByRole("button", { name: /^admin/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("dialog", { name: "Navigation blocked" })).toHaveCount(0);
});

for (const hasBlocker of [false, true]) {
  test(`scope inspection scroll reaches the panel bottom with active blocker: ${String(hasBlocker)}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/checkout");
    if (hasBlocker) {
      await page.getByRole("button", { name: "Start agent edit" }).click();
    }
    await page.getByTitle("Open Action Guard Devtools", { exact: true }).click();
    await page.getByRole("button", { name: "Active Blockers" }).click();
    const table = page.getByRole("table", { name: "Scope protection" });
    const lastRow = table.getByRole("row").last();
    const inspection = page.getByRole("region", { name: "Active blocker inspection" });
    await inspection.focus();
    await page.keyboard.press("End");
    await expect(lastRow).toBeInViewport({ ratio: 1 });
    const bounds = await lastRow.boundingBox();
    assertDefined(bounds);
    expect(bounds.y + bounds.height).toBeGreaterThan(850);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(885);
    const graph = page.getByRole("region", { name: "Scope relationships" });
    expect(await graph.evaluate((element) => element.scrollHeight <= element.clientHeight)).toBe(
      true
    );
    await page.screenshot({ path: `.cache/browser/scope-scroll-${String(hasBlocker)}.png` });
  });
}
