import { test } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";
import { DairyProfilePage } from "../pages/dairyProfilePage";
import { CowCardOverviewPage } from "../pages/cowCardOverviewPage";

test.describe("FC-TC-23 - EDAY manual override", () => {
  test("@new EDAY field accepts manual date override and saves correctly", async ({ page }) => {
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

    await myHomePage.openDairySelector();
    await myHomePage.selectArtAutomationIconHolsteins();

    // Act: open known cow card and add BRED event with manual EDAY
    await dairyProfilePage.searchAndOpenCowCardId11();

    await cowCardOverviewPage.openAddEvent();
    await cowCardOverviewPage.selectEventTypeBred();

    // NOTE: 01/04/2026 triggered "Event date is before fresh date" for this animal during live exploration.
    // Using a past date that is still after the animal's fresh date so the event can be saved.
    await cowCardOverviewPage.setEdayDate("03/01/2026");
    await cowCardOverviewPage.fillRequiredFieldsForBred();
    await cowCardOverviewPage.clickSave();

    // Assert: recent events shows the new event with the manually entered date
    await cowCardOverviewPage.assertRecentEventsVisible();
    await cowCardOverviewPage.assertRecentEventsContainsEventWithDate({
      eventType: "BRED",
      date: "03/01/26",
    });
  });
});
