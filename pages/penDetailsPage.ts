import { expect, type Locator, type Page } from "@playwright/test";

export class PenDetailsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }


  get animalId40019Text(): Locator {
    return this.page.getByText("40019");
  }

  get drawerGoToCowcardLink(): Locator {
    return this.page.getByRole("link", { name: "Go To Cowcard" });
  }

  get drawerAddEventsText(): Locator {
    return this.page.getByText("Add events");
  }

  get addEventHeading(): Locator {
    return this.page.getByRole("heading", { name: "Add Event" });
  }

  get searchForSpecificEventPlaceholder(): Locator {
    return this.page.getByText("Search for a specific event");
  }

  get okEventOption(): Locator {
    return this.page.getByText("2OKENTER EC=2 EDAY REM TECH");
  }

  get edayLabel(): Locator {
    return this.page.getByText("EDAY *");
  }

  get edayInput(): Locator {
    return this.page.getByRole("textbox").nth(4);
  }

  async openDrawerForKnownAnimal(): Promise<void> {
    await expect(this.animalId40019Text).toBeVisible();
    await expect(this.animalId40019Text).toBeEnabled();
    await this.animalId40019Text.click();
  }

  async assertDrawerIsDisplayedForSelectedAnimal(): Promise<void> {
    await expect(this.drawerGoToCowcardLink).toBeVisible();
    await expect(this.drawerGoToCowcardLink).toBeEnabled();
  }

  async openAddEventFromDrawer(): Promise<void> {
    await expect(this.drawerAddEventsText).toBeVisible();
    await expect(this.drawerAddEventsText).toBeEnabled();
    await this.drawerAddEventsText.click();

    await expect(this.addEventHeading).toBeVisible();
  }

  async selectOkEvent(): Promise<void> {
    await expect(this.searchForSpecificEventPlaceholder).toBeVisible();
    await expect(this.searchForSpecificEventPlaceholder).toBeEnabled();
    await this.searchForSpecificEventPlaceholder.click();

    await expect(this.okEventOption).toBeVisible();
    await expect(this.okEventOption).toBeEnabled();
    await this.okEventOption.click();
  }

  async assertEdayDefaultsToDairyLocalDate(): Promise<void> {
    await expect(this.edayLabel).toBeVisible();
    await expect(this.edayInput).toBeVisible();
    await expect(this.edayInput).toHaveValue("06/17/2026");
  }
}
