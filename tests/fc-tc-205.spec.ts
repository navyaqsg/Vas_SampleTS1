import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";
import { FeedCompReportsLoadErrorPage } from "../pages/feedCompReportsLoadErrorPage";

test.describe("FeedComp Reports - Load Error", () => {
  test("@new FC-TC-205 Smoke - Load Error report page loads with primary elements", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const loadErrorPage = new FeedCompReportsLoadErrorPage(page);

    // Arrange
    await loginPage.goto();
    await loginPage.login({
      username: process.env.TEST_USERNAME ?? process.env.APP_USERNAME ?? "",
      password: process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD ?? "",
    });
    await loginPage.assertLoggedIn();

    // Act
    await myHomePage.selectDairy({ dairyName: "ART Automation Icon Holsteins" });

    // Assert
    await loadErrorPage.goto({ dairyId: "34858" });
    await loadErrorPage.assertOnPage();
    await loadErrorPage.assertReportTabsVisibleInOrder();
    await loadErrorPage.assertLoadErrorTabIsActive();
    await loadErrorPage.assertFilterBarVisible();
    await loadErrorPage.assertViewToggleVisible();

    // Current environment snapshot shows a "No data" state; metrics/table are not rendered.
    await loadErrorPage.assertSummaryMetricsVisible();
    await loadErrorPage.assertTableHeadersVisible();
  });
});
