import { expect, test } from "@playwright/test";

test.beforeEach(async ({ browser }, testInfo) => {
  testInfo.annotations.push({ type: "browser-version", description: browser.version() });
});

for (const adapter of ["Pages", "App"]) {
  const route = adapter === "Pages" ? "/pages-home" : "/app-home";
  const disable = adapter === "Pages" ? "Detach guard" : "Disable unload";
  const ready = adapter === "Pages" ? "Protection: true" : "Enable unload";

  test(`should request a native ${adapter} unload prompt and remove it after cleanup`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.getByText(ready, { exact: true })).toBeVisible();
    // Native prompts require user activation. Reload is a real document navigation.
    await page.getByRole("heading", { name: `${adapter} home` }).click();
    await page.evaluate(() => {
      document.documentElement.dataset.documentToken = "original";
    });
    const dialogPromise = page.waitForEvent("dialog");
    // Do not wait for a load that a cancelled reload intentionally never produces.
    await page.evaluate(() => {
      setTimeout(() => window.location.reload(), 0);
    });
    const dialog = await dialogPromise;
    expect(dialog.type()).toBe("beforeunload");
    await dialog.dismiss();
    expect(await page.evaluate(() => document.documentElement.dataset.documentToken)).toBe(
      "original"
    );
    await expect(page).toHaveURL(new RegExp(`${route}$`));
    await expect(page.getByRole("heading", { name: `${adapter} home` })).toBeVisible();
    const acceptedDialogPromise = page.waitForEvent("dialog");
    const acceptedReload = page.reload();
    const acceptedDialog = await acceptedDialogPromise;
    expect(acceptedDialog.type()).toBe("beforeunload");
    await acceptedDialog.accept();
    await acceptedReload;
    await expect(page.getByRole("heading", { name: `${adapter} home` })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.dataset.documentToken)
    ).toBeUndefined();
    await page.getByRole("button", { name: disable }).click();
    let subsequentDialogs = 0;
    page.on("dialog", async (nextDialog) => {
      subsequentDialogs += 1;
      await nextDialog.accept();
    });
    await page.reload();
    await expect(page.getByRole("heading", { name: `${adapter} home` })).toBeVisible();
    expect(subsequentDialogs).toBe(0);
  });
}
