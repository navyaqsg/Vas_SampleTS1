import { test } from "@playwright/test";

const DAIRY_NAME = "ART Automation Icon Holsteins";
import { LoginPage } from "../pages/loginPage";
import { MyHomePage } from "../pages/myHomePage";
import { DairyProfilePage } from "../pages/dairyProfilePage";
import { PenDetailsPage } from "../pages/penDetailsPage";

test.describe("FC-TC-25 - EDAY defaults to dairy local date from drawer entry point", () => {
  test("@new EDAY field defaults to dairy local date when opening Add Event from the drawer entry point", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myHomePage = new MyHomePage(page);
    const dairyProfilePage = new DairyProfilePage(page);
    const penDetailsPage = new PenDetailsPage(page);

    // Arrange
    await loginPage.goto();
    await loginPage.login({
      username: process.env.TEST_USERNAME ?? process.env.APP_USERNAME ?? "",
      password: process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD ?? "",
    });
    await loginPage.assertLoggedIn();

    await myHomePage.openSelectDairy();
    await myHomePage.selectDairy({ dairyName: DAIRY_NAME });

    // Act
    await dairyProfilePage.openDairyCompOverview();
    await dairyProfilePage.openAnimalList();
    await dairyProfilePage.openPen18FromAnimalsList();

    await penDetailsPage.openDrawerForKnownAnimal();
    await penDetailsPage.assertDrawerIsDisplayedForSelectedAnimal();

    await penDetailsPage.openAddEventFromDrawer();
    await penDetailsPage.selectOkEvent();

    // Assert
    await penDetailsPage.assertEdayDefaultsToDairyLocalDate();
  });
});
