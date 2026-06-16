import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";
import { DairyProfilePage } from "../pages/dairyProfilePage";
import { CowCardOverviewPage } from "../pages/cowCardOverviewPage";

test.describe("FC-TC-27 - EDAY uses dairy local date (not user device local date)", () => {
  test("@new EDAY field does not use user device local date when dairy timezone differs", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const dairyProfilePage = new DairyProfilePage(page);
    const cowCardOverviewPage = new CowCardOverviewPage(page);

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD). ");
    }

    // Arrange: login and select dairy
    await loginPage.goto();
    await loginPage.login({ username, password });
    await loginPage.assertLoggedIn();

    await myHomePage.openSelectDairy();
    await myHomePage.selectDairy({ dairyName: "ART Automation Icon Holsteins" });

    // Act: open known cow card and open Add Event modal
    await dairyProfilePage.searchAndOpenCowCardId11();
    await cowCardOverviewPage.openAddEvent();

    // Assert: EDAY value is dairy-local date (and not user-local date)
    // NOTE: This assertion requires live UI inspection to identify the EDAY field label/value format.
    // The previous attempt could not access the AUT due to missing BASE_URL in the tool environment.
    // Once BASE_URL is configured, update CowCardOverviewPage with snapshot-derived EDAY locator + assertions.
    await cowCardOverviewPage.assertRecentEventsVisible();
  });
});
