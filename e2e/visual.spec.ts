import { expect, test } from "@playwright/test";
import { mockSpotify, seedAuth } from "./support/app-fixture";

const screenshots = [
  {
    name: "dashboard-desktop",
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "dashboard-mobile",
    viewport: { width: 390, height: 844 },
  },
] as const;

for (const screenshot of screenshots) {
  test(`matches the ${screenshot.name} visual baseline`, async ({
    page,
  }) => {
    await page.setViewportSize(screenshot.viewport);
    await seedAuth(page);
    await mockSpotify(page);
    await page.goto("/");

    await expect(
      page.getByText("Your listening, in one place."),
    ).toBeVisible();
    await expect(
      page.locator('[data-component="ranking-list"] li'),
    ).toHaveCount(50);
    await page.waitForFunction(async () => {
      await document.fonts.ready;
      return Array.from(document.images)
        .filter(
          (image) =>
            image.getBoundingClientRect().top < window.innerHeight,
        )
        .every((image) => image.complete);
    });

    await expect(page).toHaveScreenshot(`${screenshot.name}.png`, {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.005,
    });
  });
}
