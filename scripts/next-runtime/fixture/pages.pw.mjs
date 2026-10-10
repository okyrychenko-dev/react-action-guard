import { expect, test } from "@playwright/test";

test.beforeEach(async ({ browser }, testInfo) => {
  testInfo.annotations.push({ type: "browser-version", description: browser.version() });
});

test("should cancel a Pages attempt then allow the next attempt exactly once", async ({ page }) => {
  await page.goto("/pages-home");
  await expect(page.getByText("Protection: true")).toBeVisible();
  await page.getByRole("button", { name: "Push first" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("1");
  await page.getByRole("button", { name: "Cancel oldest" }).click();
  await expect(page.getByTestId("allows")).toHaveText("0");
  await expect(page).toHaveURL(/\/pages-home$/);
  await page.getByRole("button", { name: "Push second" }).click();
  await expect(page.getByTestId("blocks")).toHaveText("2");
  await expect(page.getByTestId("prompts")).toHaveText("2");
  await page.getByRole("button", { name: "Approve oldest" }).click();
  await expect(page).toHaveURL(/\/pages-target\?via=second$/);
  await expect(page.getByTestId("allows")).toHaveText("1");
  await expect(page.getByTestId("blocks")).toHaveText("2");
  await page.getByRole("button", { name: "Push second" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("3");
  await page.getByRole("button", { name: "Cancel oldest" }).click();
  await expect(page.getByTestId("allows")).toHaveText("1");
  await expect(page.getByTestId("blocks")).toHaveText("3");
  await expect(page).toHaveURL(/\/pages-target\?via=second$/);
});

test("should discard a superseded Pages answer and approve only the latest URL", async ({
  page,
}) => {
  await page.goto("/pages-home");
  await expect(page.getByText("Protection: true")).toBeVisible();
  const destinations = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) destinations.push(frame.url());
  });
  await page.getByRole("button", { name: "Push first" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("1");
  await page.getByRole("button", { name: "Push second" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("2");
  await page.getByRole("button", { name: "Approve oldest" }).click();
  await expect(page.getByTestId("answers")).toHaveText("1");
  await expect(page.getByTestId("allows")).toHaveText("0");
  await page.getByRole("button", { name: "Approve oldest" }).click();
  await expect(page).toHaveURL(/\/pages-target\?via=second$/);
  await expect(page.getByTestId("allows")).toHaveText("1");
  expect(destinations).toEqual([new URL("/pages-target?via=second", page.url()).href]);
});

test("should invalidate a Pages answer after owner detach and protect a fresh owner", async ({
  page,
}) => {
  await page.goto("/pages-home");
  await expect(page.getByText("Protection: true")).toBeVisible();
  await page.getByRole("button", { name: "Push first" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("1");
  await page.getByRole("button", { name: "Detach guard" }).click();
  await expect(page.getByText("Protection: true")).toHaveCount(0);
  await page.getByRole("button", { name: "Attach guard" }).click();
  await expect(page.getByText("Protection: true")).toBeVisible();
  await page.getByRole("button", { name: "Approve oldest" }).click();
  await expect(page.getByTestId("answers")).toHaveText("1");
  await page.getByRole("button", { name: "Push second" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("2");
  await page.getByRole("button", { name: "Cancel oldest" }).click();
  await expect(page.getByTestId("answers")).toHaveText("2");
  await expect(page.getByTestId("allows")).toHaveText("0");
  await expect(page).toHaveURL(/\/pages-home$/);
});

test("should approve a Pages Link once and ask again for a subsequent navigation", async ({
  page,
}) => {
  await page.goto("/pages-home");
  await expect(page.getByText("Protection: true")).toBeVisible();
  await page.getByRole("link", { name: "Link target" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("1");
  await page.getByRole("button", { name: "Approve oldest" }).click();
  await expect(page).toHaveURL(/\/pages-target\?via=link$/);
  await expect(page.getByTestId("allows")).toHaveText("1");
  await page.getByRole("button", { name: "Push first" }).click();
  await expect(page.getByTestId("prompts")).toHaveText("2");
  await page.getByRole("button", { name: "Cancel oldest" }).click();
  await expect(page.getByTestId("allows")).toHaveText("1");
  await expect(page.getByTestId("blocks")).toHaveText("2");
  await expect(page).toHaveURL(/\/pages-target\?via=link$/);
});
