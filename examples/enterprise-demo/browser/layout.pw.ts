import { expect, test } from "@playwright/test";

for (const width of [390, 820, 1440]) {
  test(`guided demo and navigation remain usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "From a blocked action to a safe recovery" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Open a second demo tab" })).toHaveAttribute(
      "target",
      "_blank"
    );
    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("button", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({ path: `.cache/browser/dashboard-${width}.png`, fullPage: true });
    await page.getByRole("link", { name: "Start in Checkout" }).click();
    await expect(page.getByRole("textbox", { name: "Shipping address" })).toBeVisible();
    await page.getByRole("textbox", { name: "Shipping address" }).fill("Responsive demo address");
    await navigation.getByRole("button", { name: /^admin/i }).click();
    await expect(page.getByRole("dialog", { name: "Navigation blocked" })).toBeVisible();
    await page.getByRole("button", { name: "Stay and save" }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await page.getByText("Live guard inspector", { exact: false }).click();
    await expect(page.getByRole("heading", { name: "Blocker inspector" })).toBeHidden();
    await page.getByText("Live guard inspector", { exact: false }).click();
    await expect(page.getByRole("heading", { name: "Blocker inspector" })).toBeVisible();
    await page.screenshot({ path: `.cache/browser/layout-${width}.png`, fullPage: true });
  });
}
