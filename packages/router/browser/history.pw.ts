import { expect, test as it } from "@playwright/test";

for (const direction of ["back", "forward"]) {
  const step = direction === "back" ? -1 : 1;

  it(`should cancel and confirm browser ${direction} while protecting subsequent attempts`, async ({
    page,
    browser,
  }, testInfo) => {
    testInfo.annotations.push({ type: "browser-version", description: browser.version() });

    await page.goto("/");
    await expect(page.getByRole("status", { name: "Location" })).toHaveText("/");
    await page.getByRole("link", { name: "Next", exact: true }).click();
    await expect(page).toHaveURL("/next");
    await page.getByRole("link", { name: "Other", exact: true }).click();
    await expect(page).toHaveURL("/other");

    if (direction === "forward") {
      await page.goBack();
      await expect(page).toHaveURL("/next");
    }

    const origin = direction === "back" ? "/other" : "/next";
    const destination = direction === "back" ? "/next" : "/other";

    await page.getByRole("checkbox", { name: "Protect navigation" }).check();
    await page.evaluate((movement) => {
      window.history.go(movement);
    }, step);
    await expect(page.getByRole("dialog", { name: "Leave editor?" })).toBeVisible();
    await expect(page.getByRole("status", { name: "Location" })).toHaveText(origin);
    await page.getByRole("button", { name: "Stay", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(origin);
    await expect(page.getByRole("status", { name: "Location" })).toHaveText(origin);
    await expect(page.getByRole("status", { name: "Allowed attempts" })).toHaveText("0");

    await page.evaluate((movement) => {
      window.history.go(movement);
    }, step);
    await expect(page.getByRole("dialog", { name: "Leave editor?" })).toBeVisible();
    await page.getByRole("button", { name: "Leave", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("status", { name: "Location" })).toHaveText(destination);
    await expect(page.getByRole("status", { name: "Allowed attempts" })).toHaveText("1");

    await page.evaluate((movement) => {
      window.history.go(movement);
    }, -step);
    await expect(page.getByRole("dialog", { name: "Leave editor?" })).toBeVisible();
    await page.getByRole("button", { name: "Stay", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("status", { name: "Location" })).toHaveText(destination);
    await expect(page.getByRole("status", { name: "Blocked attempts" })).toHaveText("3");
    await expect(page.getByRole("status", { name: "Allowed attempts" })).toHaveText("1");
  });
}
