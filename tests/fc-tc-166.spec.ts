import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";
import { IntegrationStatusPage } from "../pages/integrationStatusPage";

test.describe("Integration Status", () => {
  test("@new FC-TC-166 - Smoke test for Integration Status page load and all integration cards visibility", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const integrationStatusPage = new IntegrationStatusPage(page);

    const username: string =
      process.env.TEST_USERNAME ?? process.env.APP_USERNAME ?? "";
    const password: string =
      process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD ?? "";

    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login({ username, password });
    await loginPage.assertLoggedIn();

    await myHomePage.openSelectDairy();
    await myHomePage.selectDairy({ dairyName: "ART Automation Icon Holsteins" });

    await integrationStatusPage.goto();

    // Assert
    await integrationStatusPage.assertOnIntegrationStatusPage();
    await integrationStatusPage.assertPageTitleVisible();
    await integrationStatusPage.assertBreadcrumbContainsDairyAndIntegrationStatus();
    await integrationStatusPage.assertDefaultZoneTabIsActive();
    await integrationStatusPage.assertIntegrationCardsVisible();
    await integrationStatusPage.assertNeedHelpLinkVisible();
  });
});
