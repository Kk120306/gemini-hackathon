import { expect, test } from "@playwright/test";

const stateKey = "anchor.fixture.state.v4";

async function openQuestion(
  page: import("@playwright/test").Page,
  index: number,
) {
  await page.goto("/patient/session");
  await page.waitForFunction((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw).session.status === "active" : false;
  }, stateKey);
  await page.evaluate(
    ({ key, questionIndex }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        throw new Error("Prepared state was not persisted.");
      }
      const state = JSON.parse(raw) as {
        session: {
          questionIndex: number;
          cueLevel: string;
          feedback: string;
          status: string;
        };
      };
      state.session.questionIndex = questionIndex;
      state.session.cueLevel = "none";
      state.session.feedback = "idle";
      state.session.status = "active";
      window.localStorage.setItem(key, JSON.stringify(state));
    },
    { key: stateKey, questionIndex: index },
  );
  await page.reload();
}

test("the verified image is the answer surface, not a multiple-choice card", async ({
  page,
}) => {
  await page.goto("/patient/session");
  const scene = page.locator(".session-scene");

  await expect(scene).toHaveAttribute("data-interaction-mode", "tap_object");
  await expect(page.locator(".spatial-hotspot")).toHaveCount(3);
  await expect(page.locator(".answer-grid")).toHaveCount(0);
  await expect(page.locator(".reasoning-path li")).toHaveCount(3);
  await expect(
    page.getByRole("heading", {
      name: /dark blue reading glasses.*bedside table.*lower right/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Choose Reading glasses in the room" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Choose Blue mug in the room" }),
  ).toBeVisible();

  const centers = await page
    .locator(".spatial-hotspot")
    .evaluateAll((buttons) =>
      buttons.map((button) => {
        const box = button.getBoundingClientRect();
        return box.left + box.width / 2;
      }),
    );
  expect(Math.max(...centers) - Math.min(...centers)).toBeGreaterThan(225);
});

test("visual recall hides the room only after the patient is ready", async ({
  page,
}) => {
  await openQuestion(page, 4);
  const scene = page.locator(".session-scene");

  await expect(
    page.getByRole("heading", {
      name: /exact six-region position/i,
    }),
  ).toBeVisible();
  await expect(page.locator(".recall-zone-layer")).toHaveCount(0);
  await page.getByRole("button", { name: "I'm ready. Hide the room." }).click();

  await expect(scene).toHaveClass(/session-scene--recall-hidden/);
  await expect(page.locator(".recall-zone-layer button")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Choose upper right region of the room" })
    .click();
  await expect(page.locator(".session-feedback--correct")).toContainText(
    "upper right",
  );
  await expect(scene).not.toHaveClass(/session-scene--recall-hidden/);
});

test("the association activity uses a verified landmark in the scene", async ({
  page,
}) => {
  await openQuestion(page, 5);

  await expect(
    page.getByRole("heading", {
      name: /lamp and one different object share the bedside table/i,
    }),
  ).toBeVisible();
  await expect(page.locator(".spatial-landmark")).toHaveCount(1);
  await expect(page.locator(".spatial-hotspot")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Choose Reading glasses in the room" })
    .click();
  await expect(page.locator(".session-feedback--correct")).toContainText(
    "both verified on the bedside table",
  );
});
