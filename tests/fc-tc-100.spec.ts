import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";

test.describe("FC-TC-100 - WeighComp integration status", () => {
  test("@new WeighComp card shows HEALTHY when heartbeats isHealthy is true", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!process.env.BASE_URL) {
      throw new Error("Missing BASE_URL. Set BASE_URL to the VAS Pulse Platform environment URL.");
    }

    if (!username || !password) {
      throw new Error("Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD). ");
    }

    // Arrange: login
    await loginPage.goto();
    await loginPage.login({ username, password });
    await loginPage.assertLoggedIn();

    // Act: select dairy
    await myHomePage.openDairySelector();
    await myHomePage.selectArtAutomationIconHolsteins();

    // Assert:
    // This test requires live UI exploration to derive exact locators for:
    // - Dairy module navigation
    // - Integration Status menu item
    // - WeighComp card, HEALTHY label, error indicator, and Last beat timestamp
    // Exploration is currently blocked because BASE_URL is not configured in the environment.
    test.fail(true, "Blocked: BASE_URL not configured; Integration Status page locators must be derived from live snapshot.");
  });
});
