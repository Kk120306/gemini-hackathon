import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("caregiver and patient route shells render in fixture mode", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Familiar spaces. Gentle next steps." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Prepare an activity" }).click();
  await expect(
    page.getByRole("heading", { name: "Create one calm, familiar activity." }),
  ).toBeVisible();

  await page.goto("/caregiver/world-model");
  await expect(
    page.getByRole("heading", { name: "Verify what Gemma observed." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Reading glasses on the bedside table",
    }),
  ).toBeVisible();

  await page.goto("/patient/session");
  await expect(
    page.getByRole("heading", {
      name: "Find the dark blue reading glasses on the bedside table.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("AI-generated guide based on Elena", { exact: true }),
  ).toBeVisible();
});

test("patient shell has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/patient/session");

  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();

  expect(
    results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);

  const interactiveSizes = await page
    .locator(".spatial-hotspot, .session-controls button")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rectangle = element.getBoundingClientRect();
        return { height: rectangle.height, width: rectangle.width };
      }),
    );

  for (const size of interactiveSizes) {
    expect(size.height).toBeGreaterThanOrEqual(64);
    expect(size.width).toBeGreaterThanOrEqual(64);
  }
});
