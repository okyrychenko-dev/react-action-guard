import { expect, test } from "@playwright/test";

test("dirty checkout sidebar navigation can be cancelled or confirmed", async ({ page }) => {
  await page.goto("/checkout");
  await page.getByRole("textbox", { name: "Shipping address" }).fill("Unsaved browser address");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /^admin/i })
    .click();
  await expect(page.getByRole("dialog", { name: "Navigation blocked" })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole("button", { name: "Stay and save" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /^admin/i })
    .click();
  await page.getByRole("button", { name: "Leave anyway" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("dirty checkout browser back and forward retain the route on cancel and replay on confirm", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /^checkout/i })
    .click();
  await page.getByRole("textbox", { name: "Shipping address" }).fill("Unsaved history address");
  await page.evaluate(() => window.history.back());
  await expect(page.getByRole("dialog", { name: "Navigation blocked" })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole("button", { name: "Stay and save" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.evaluate(() => window.history.back());
  await page.getByRole("button", { name: "Leave anyway" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4174/");
  await page.evaluate(() => window.history.forward());
  await expect(page).toHaveURL(/\/checkout$/);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /^admin/i })
    .click();
  await page.evaluate(() => window.history.back());
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole("textbox", { name: "Shipping address" }).fill("Unsaved forward address");
  await page.evaluate(() => window.history.forward());
  await expect(page.getByRole("dialog", { name: "Navigation blocked" })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole("button", { name: "Stay and save" }).click();
  await page.evaluate(() => window.history.forward());
  await page.getByRole("button", { name: "Leave anyway" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});
