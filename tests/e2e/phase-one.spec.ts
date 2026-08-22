import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

async function prepareRoom(page: Page, editLocation?: string) {
  await page.goto("/caregiver");
  await page.getByRole("button", { name: "Begin caregiver setup" }).click();
  await page.getByLabel("Preferred first name").fill("Maya");
  await page.getByLabel("Room name").fill("Bedroom");
  await page.getByRole("button", { name: "Save and continue" }).click();

  await page
    .getByLabel("Replace image")
    .setInputFiles(path.resolve("public/fixtures/bedroom.svg"));
  await expect(page.getByText("bedroom.svg", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Find visible objects" }).click();
  await expect(
    page.getByRole("heading", { name: "Verify what Gemma observed." }),
  ).toBeVisible();
  await expect(page.locator(".evidence-card img")).toHaveAttribute(
    "src",
    /\/api\/room-media\//,
  );

  if (editLocation) {
    const firstObject = page.locator(".object-row").first();
    await firstObject.getByRole("button", { name: "Edit" }).click();
    await firstObject.getByLabel("Location").fill(editLocation);
    await firstObject.getByRole("button", { name: "Save" }).click();
    await expect(
      page.getByRole("heading", {
        name: `Reading glasses on the ${editLocation}`,
      }),
    ).toBeVisible();
  }

  await page.getByRole("button", { name: /Approve room model/ }).click();
}

async function prepareGuide(page: Page, useNeutralGuide: boolean) {
  await page.getByLabel("Name").fill("Elena");
  await page.getByLabel("Relationship").fill("daughter");
  if (!useNeutralGuide) {
    await page
      .getByRole("checkbox", {
        name: /I confirm permission to generate this likeness/,
      })
      .check();
  }
  await page.getByRole("button", { name: "Save details" }).click();

  if (useNeutralGuide) {
    await page.getByRole("button", { name: "Use neutral guide" }).click();
    await expect(page.getByText("No family likeness is shown.")).toBeVisible();
  } else {
    const generate = page.getByRole("button", {
      name: "Generate fixture guide",
    });
    await expect(generate).toBeEnabled();
    await generate.click();
    await expect(
      page.getByText("AI-generated guide based on Elena"),
    ).toBeVisible();
  }

  await page.getByRole("button", { name: "Approve guide" }).click();
  await page.getByRole("button", { name: "Generate six questions" }).click();
  await expect(page.locator(".lesson-list li")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Approve and open patient mode" })
    .click();
}

async function answerRemainingQuestions(
  page: Page,
  answers: readonly string[],
) {
  for (const answer of answers) {
    if (answer === "Right side") {
      await page
        .getByRole("button", { name: "I'm ready. Hide the room." })
        .click();
      await page
        .getByRole("button", { name: "Choose right side of the room" })
        .click();
    } else {
      await page
        .getByRole("button", { name: `Choose ${answer} in the room` })
        .click();
    }
    await expect(page.locator(".session-feedback--correct")).toBeVisible();
    await page
      .getByRole("button", { name: /Next question|Finish activity/ })
      .click();
  }
}

test("caregiver correction persists into the complete six-question flow", async ({
  page,
}) => {
  await prepareRoom(page, "reading table");
  await prepareGuide(page, false);

  await expect(
    page.getByText(
      /Touch the reading glasses exactly where it appears on the reading table/,
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start activity" }).click();

  await page
    .getByRole("button", { name: "Choose Blue mug in the room" })
    .click();
  await expect(page.getByText(/scan the reading table/i)).toBeVisible();
  await page.getByRole("button", { name: "Help me" }).click();
  await expect(page.getByText("Verified target highlighted")).toBeVisible();
  await page.getByRole("button", { name: "Help me" }).click();
  await expect(
    page.getByText(
      /Prepared simplified view|AI-generated simplified view|Verified simplified fallback/,
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Help me" }).click();
  await expect(
    page.getByText(/verified answer is Reading glasses/i),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Choose Reading glasses in the room" })
    .click();
  await page.getByRole("button", { name: "Next question" }).click();

  await answerRemainingQuestions(page, [
    "Reading glasses",
    "Blue mug",
    "Lamp",
    "Right side",
    "Reading glasses",
  ]);

  await expect(
    page.getByRole("heading", { name: "Thank you for looking together." }),
  ).toBeVisible();
  await expect(page.getByText(/score/i)).toHaveCount(0);
});

test("neutral guide and deterministic media fallback complete without likeness media", async ({
  page,
}) => {
  await prepareRoom(page);
  await prepareGuide(page, true);
  await expect(page.getByText("AI-generated neutral guide")).toBeVisible();
  await page.getByRole("button", { name: "Start activity" }).click();
  await expect(page.getByText("AI-generated neutral guide")).toBeVisible();

  await answerRemainingQuestions(page, [
    "Reading glasses",
    "Reading glasses",
    "Blue mug",
    "Lamp",
    "Right side",
    "Reading glasses",
  ]);

  await expect(
    page.getByRole("heading", { name: "Thank you for looking together." }),
  ).toBeVisible();
});

test("interactive patient flow remains accessible and fits the tablet viewport", async ({
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

  const viewportMetrics = await page.evaluate(() => ({
    documentHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(viewportMetrics.documentHeight).toBeLessThanOrEqual(
    viewportMetrics.viewportHeight,
  );
});
