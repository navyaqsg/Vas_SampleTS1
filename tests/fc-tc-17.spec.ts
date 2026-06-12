import { test } from "@playwright/test";
import type { DairiesSearchParams } from "../types/dairies.types";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";
import { DairiesPage } from "../pages/dairiesPage";

test.describe("FC-TC-17 - Dairies search", () => {
  test("@new Smoke: Verify search functionality on the Dairies page works end-to-end", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const dairiesPage = new DairiesPage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD). ");
    }

    // Arrange: login and select dairy
    await loginPage.goto();
    await loginPage.login({ username, password });
    await loginPage.assertLoggedIn();

    await myHomePage.openDairySelector();
    await myHomePage.selectArtAutomationIconHolsteins();

    // Act: open dairies page and search
    await dairiesPage.goto();
    await dairiesPage.assertOnDairiesPage();

    const searchParams: DairiesSearchParams = {
      term: "3268456",
      expectedStatus: 200,
    };

    const responsePromise = dairiesPage.waitForDairiesSearchResponse({ expectedStatus: searchParams.expectedStatus });
    await dairiesPage.search({ term: searchParams.term });
    await responsePromise;

    // Assert: results render and no broken images
    await dairiesPage.assertResultsVisible();
    await dairiesPage.assertNoBrokenImagesInMainContent();
  });
});
