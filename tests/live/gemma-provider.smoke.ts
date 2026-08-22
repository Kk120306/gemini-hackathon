import { expect, test } from "@playwright/test";

test("prepared room reaches patient mode through live Gemma", async ({
  page,
}) => {
  await page.goto("/caregiver");
  await page.getByRole("button", { name: "Begin caregiver setup" }).click();
  await page.getByLabel("Preferred first name").fill("Maya");
  await page.getByLabel("Room name").fill("Bedroom");
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page.getByRole("button", { name: "Find visible objects" }).click();
  await expect(
    page.getByRole("heading", { name: "Verify what Gemma observed." }),
  ).toBeVisible();
  await expect(page.getByText(/\d by Gemma/)).toBeVisible();
  const proposalCount = await page.locator(".object-row").count();
  expect(proposalCount).toBeGreaterThanOrEqual(3);
  expect(proposalCount).toBeLessThanOrEqual(5);
  await expect(page.locator(".evidence-card img")).toHaveAttribute(
    "src",
    /\/api\/room-media\//,
  );

  await page.getByRole("button", { name: /Approve room model/ }).click();
  await page.getByLabel("Name").fill("Elena");
  await page.getByLabel("Relationship").fill("daughter");
  await page.getByRole("button", { name: "Save details" }).click();
  await page.getByRole("button", { name: "Use neutral guide" }).click();
  await page.getByRole("button", { name: "Approve guide" }).click();

  await page.getByRole("button", { name: "Generate six questions" }).click();
  await expect(page.locator(".lesson-list li")).toHaveCount(6);
  await expect(page.getByText("Visual recall", { exact: true })).toBeVisible();
  await expect(page.getByText("Association", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Approve and open patient mode" })
    .click();
  await page.getByRole("button", { name: "Start activity" }).click();
  await expect(page.getByLabel("Question 1 of 6")).toBeVisible();
});
