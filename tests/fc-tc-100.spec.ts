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
    // NOTE: This test is intentionally blocked until the Integration Status page is explored
    // and locators are derived from live snapshots.
    //
    // In CI, if BASE_URL is misconfigured/unreachable, fail fast with a clear error.
    // (Do not mark as expected-to-fail; that causes "Expected to fail, but passed" failures.)
    throw new Error(
      "Blocked: Integration Status page locators must be derived from live snapshots. " +
        "Ensure BASE_URL points to a reachable VAS Pulse Platform environment and re-run after exploration."
    );
  });
});
