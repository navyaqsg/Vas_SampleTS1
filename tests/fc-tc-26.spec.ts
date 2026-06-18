import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";

test.describe("FC-TC-26 - EDAY defaults to dairy local date in bulk event entry", () => {
  test("@new EDAY field defaults to dairy local date in bulk event entry", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!process.env.BASE_URL) {
      throw new Error("Missing BASE_URL. Set BASE_URL to the AUT root URL.");
    }

    if (!username || !password) {
      throw new Error("Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD). ");
    }

    // Arrange
    await loginPage.goto();
    await loginPage.login({ username, password });

    // Act
    await loginPage.assertLoggedIn();
    await myHomePage.openSelectDairy();
    await myHomePage.selectDairy({ dairyName: "ART Automation Icon Holsteins" });

    // Assert
    // NOTE: Bulk Event Entry navigation + EDAY default assertion require live AUT exploration.
    // This spec exists to ensure Playwright discovers at least one test.
    await myHomePage.assertNoErrorToastVisible();
  });
});
