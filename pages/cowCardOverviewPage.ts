import { expect, type Locator, type Page } from "@playwright/test";

export class CowCardOverviewPage {
  constructor(private readonly page: Page) {}

  private get addEventButton(): Locator {
    return this.page.getByRole("button", { name: "Add event" });
  }

  private get addEventHeading(): Locator {
    return this.page.getByRole("heading", { name: "Add Event" });
  }

  private get eventSearchInput(): Locator {
    return this.page.getByRole("textbox");
  }

  private get edayInput(): Locator {
    return this.page.getByRole("textbox").nth(1);
  }

  private get lsirInput(): Locator {
    return this.page.getByRole("textbox", { name: "LSIR *" });
  }

  private get saveButton(): Locator {
    return this.page.getByRole("button", { name: "Save" });
  }

  private get recentEventsHeading(): Locator {
    return this.page.getByRole("heading", { name: "Recent Events" });
  }

  private get recentEventsTable(): Locator {
    return this.page.getByRole("table");
  }

  async openAddEvent(): Promise<void> {
    await expect(this.addEventButton).toBeVisible();
    await this.addEventButton.click();
    await expect(this.addEventHeading).toBeVisible();
  }

  async selectEventTypeBred(): Promise<void> {
    await expect(this.eventSearchInput).toBeVisible();
    await this.eventSearchInput.fill("BRED");
    await this.eventSearchInput.press("Enter");
  }

  async setEdayDate(date: string): Promise<void> {
    await expect(this.edayInput).toBeVisible();
    await this.edayInput.fill(date);
    await expect(this.edayInput).toHaveValue(date);
  }

  async fillRequiredFieldsForBred(): Promise<void> {
    await expect(this.lsirInput).toBeVisible();
    await this.lsirInput.fill("TEST");
  }

  async clickSave(): Promise<void> {
    await expect(this.saveButton).toBeVisible();
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
  }

  async assertRecentEventsVisible(): Promise<void> {
    await expect(this.recentEventsHeading).toBeVisible();
    await expect(this.recentEventsTable).toBeVisible();
  }

  async assertRecentEventsContainsEventWithDate(params: { eventType: string; date: string }): Promise<void> {
    await expect(this.recentEventsTable).toContainText(params.eventType);
    await expect(this.recentEventsTable).toContainText(params.date);
  }
}
