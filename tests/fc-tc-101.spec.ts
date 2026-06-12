import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";

test.describe("FC-TC-101 - WeighComp integration status null lastSyncReceivedDate", () => {
  test("@new WeighComp card remains HEALTHY when lastSyncReceivedDate is null", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!process.env.BASE_URL) {
      throw new Error("Missing BASE_URL. Set BASE_URL to the VAS Pulse Platform environment URL.");
    }

    if (!username || !password) {
      throw new Error("Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).");
    }

    // Arrange: login
    await loginPage.goto();
    await loginPage.login({ username, password });
    await loginPage.assertLoggedIn();

    // Act: select dairy
    await myHomePage.openDairySelector();
    await myHomePage.selectArtAutomationIconHolsteins();

    // Assert:
    // Blocked until live exploration can be performed to derive exact locators and the heartbeats API URL.
    // Required validations after exploration:
    // - Capture heartbeats API response and assert WeighComp item has lastSyncReceivedDate: null and isHealthy: true
    // - Assert WeighComp card shows HEALTHY and no red/blinking error state
    test.fail(true, "Blocked: requires live browser exploration to derive Integration Status locators and heartbeats API response details.");
  });
});
