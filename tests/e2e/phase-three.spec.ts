import { expect, test } from "@playwright/test";

const stateKey = "anchor.fixture.state.v4";

test("patient entry prepares the spatial room before the activity starts", async ({
  page,
}) => {
  await page.goto("/patient");
  await expect(
    page.getByText("Prepared 2.5D spatial interpretation"),
  ).toBeVisible({ timeout: 8_000 });
  await expect(
    page.getByAltText(
      "AI-generated spatial interpretation of the caregiver-approved bedroom",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start activity" }).click();
  await expect(page.locator(".session-scene")).toHaveAttribute(
    "data-spatial-source",
    "prepared-2.5d",
  );
});

test("validated room media becomes the primary spatial scene before the simplified cue", async ({
  page,
}) => {
  await page.goto("/patient/session");
  const scene = page.locator(".session-scene");

  await page
    .getByRole("button", { name: "Choose Blue mug in the room" })
    .click();
  await expect(
    page.getByRole("button", { name: "Choose Lamp in the room" }),
  ).toBeEnabled();
  await expect(scene).toHaveAttribute("data-cue-level", "verbal");
  await expect(scene).toHaveAttribute("data-media-status", "completed", {
    timeout: 8_000,
  });
  await expect(scene).toHaveAttribute("data-spatial-source", "prepared-2.5d");
  await expect(scene).toHaveAttribute("data-scene-source", "verified");
  await expect(
    page.getByText("Prepared 2.5D spatial interpretation"),
  ).toBeVisible();
  await expect(page.locator("img.session-scene__generated")).toHaveCount(1);

  await page.getByRole("button", { name: "Help me" }).click();
  await expect(scene).toHaveAttribute("data-cue-level", "focus");
  await expect(scene).toHaveAttribute("data-scene-source", "verified");
  await expect(page.getByText("Verified target highlighted")).toBeVisible();

  await page.getByRole("button", { name: "Help me" }).click();
  await expect(scene).toHaveAttribute("data-cue-level", "simplified");
  await expect(scene).toHaveAttribute("data-scene-source", "generated");
  await expect(page.getByText("Prepared simplified view")).toBeVisible();
  const generatedSrc = await page
    .locator("img.session-scene__generated")
    .getAttribute("src");
  expect(generatedSrc).toMatch(/^\/api\/generated-room-media\//);
  const response = await page.request.get(generatedSrc!);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("private, no-store");
});

test("disabled room media preserves the verified fallback and answer controls", async ({
  page,
}) => {
  await page.goto("/patient/session");
  await expect(page.getByLabel("Question 1 of 6")).toBeVisible();
  await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      throw new Error("Prepared state was not persisted.");
    }
    const state = JSON.parse(raw) as {
      lesson: {
        id: string;
        questions: Array<{ id: string; targetObjectId: string }>;
      };
      room: { imageSrc: string };
      mediaJobs: unknown[];
    };
    const question = state.lesson.questions[0];
    if (!question) {
      throw new Error("Prepared question is unavailable.");
    }
    state.mediaJobs.push({
      id: `media-room-${state.lesson.id}-${question.id}`,
      kind: "simplified_room",
      status: "disabled",
      lessonId: state.lesson.id,
      questionId: question.id,
      targetObjectId: question.targetObjectId,
      fallbackSrc: state.room.imageSrc,
      validationPassed: false,
    });
    window.localStorage.setItem(key, JSON.stringify(state));
  }, stateKey);
  await page.reload();

  await page
    .getByRole("button", { name: "Choose Blue mug in the room" })
    .click();
  await page.getByRole("button", { name: "Help me" }).click();
  await page.getByRole("button", { name: "Help me" }).click();

  const scene = page.locator(".session-scene");
  await expect(scene).toHaveAttribute("data-media-status", "disabled");
  await expect(scene).toHaveAttribute("data-scene-source", "verified");
  await expect(page.getByText("Verified simplified fallback")).toBeVisible();
  await expect(page.locator("img.session-scene__generated")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Choose Reading glasses in the room" }),
  ).toBeEnabled();
});
