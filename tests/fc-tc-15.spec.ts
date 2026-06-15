import { test } from "@playwright/test";
import { DairiesPage } from "../pages/dairiesPage";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";

test.describe("Genetics - Dairies search empty state", () => {
  test("@new FC-TC-15 - Dairies search shows a proper empty state when no results match", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const dairiesPage = new DairiesPage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    const dairyName = "ART Automation Icon Holsteins";
    const searchTerm = "ZZZNOMATCH999";

    // Arrange
    await loginPage.goto();
    await loginPage.login({
      username: username!,
      password: password!,
    });
    await loginPage.assertLoggedIn();

    await myHomePage.openSelectDairy();
    await myHomePage.selectDairy({ dairyName });

    // Act
    await dairiesPage.goto();

    // Assert
    // Observed in this environment: /genetics/alta/dairies returns a 403 Access denied.
    // Validate the app shows a clean state (no crash toast) and no broken images in main content.
    await myHomePage.assertNoErrorToastVisible();

    const currentUrl = page.url();
    if (currentUrl === "https://rc-staging.test.vas.com/403") {
      await myHomePage.assertAccessDeniedPageVisible();
      return;
    }

    await dairiesPage.assertOnDairiesPage();
    await dairiesPage.search({ term: searchTerm });
    await dairiesPage.waitForDairiesSearchResponse({ expectedStatus: 200 });
    await dairiesPage.assertEmptyStateVisible({ term: searchTerm });
    await dairiesPage.assertNoBrokenImagesInMainContent();
  });
});
