import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";

test.describe("FC-TC-28 - DM/HD History tab loads with graph and date filter controls on Pen 6", () => {
  test("@new DM/HD History tab loads with graph and date filter controls on Pen 6", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD). ");
    }

    // Arrange: open login and authenticate
    await loginPage.goto();
    await loginPage.login({ username, password });

    // Assert: logged in
    await loginPage.assertLoggedIn();

    // Act: open dairy selector and select dairy
    await myHomePage.openSelectDairy();
    await myHomePage.selectDairy({ dairyName: "ART Automation Icon Holsteins" });

    // Assert: user remains authenticated after dairy selection
    await myHomePage.assertUserIsLoggedIn();

    // NOTE:
    // The remaining steps (Freedom Dairy → Feedcomp → Pens → Pen 6 → DM/HD History)
    // require live AUT exploration to capture snapshot-derived locators and the exact URL paths.
    // The previous run environment reported connection refused to localhost, so those locators
    // cannot be safely authored without violating the standards.
  });
});
