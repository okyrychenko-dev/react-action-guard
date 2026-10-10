import { expect, test } from "@playwright/test";

test.beforeEach(async ({ browser }, testInfo) => {
  testInfo.annotations.push({ type: "browser-version", description: browser.version() });
});

test("should leave App Link, push, back and forward navigation unintercepted in one document", async ({
  page,
}) => {
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs += 1;
    await dialog.dismiss();
  });
  await page.goto("/app-home");
  await expect(page.getByTestId("protection")).toHaveText("true");
  await page.evaluate(() => {
    document.documentElement.dataset.documentToken = "original";
  });
  await page.getByRole("link", { name: "App link target" }).click();
  await expect(page).toHaveURL(/\/app-target\?via=link$/);
  await page.getByRole("button", { name: "App push home" }).click();
  await expect(page).toHaveURL(/\/app-home\?via=push$/);
  await page.getByRole("button", { name: "App back", exact: true }).click();
  await expect(page).toHaveURL(/\/app-target\?via=link$/);
  await page.getByRole("button", { name: "App forward", exact: true }).click();
  await expect(page).toHaveURL(/\/app-home\?via=push$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/app-target\?via=link$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/app-home\?via=push$/);
  await expect(page.getByTestId("protection")).toHaveText("true");
  expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
    "original"
  );
  expect(dialogs).toBe(0);
});
