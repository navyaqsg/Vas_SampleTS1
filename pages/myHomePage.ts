import { expect, type Locator, type Page } from "@playwright/test";

export class MyHomePage {
  constructor(private readonly page: Page) {}

  private get selectDairyControl(): Locator {
    return this.page.getByText("Select a Dairy");
  }

  private get dairySearchbox(): Locator {
    return this.page.getByRole("searchbox", { name: "Name or Herd Code" });
  }

  private get accessDeniedHeading(): Locator {
    return this.page.getByRole("heading", { name: "Access denied" });
  }

  private get returnHomeButton(): Locator {
    return this.page.getByRole("button", { name: "Return Home" });
  }

  private get errorToast(): Locator {
    return this.page.getByRole("status");
  }

  private get errorToastText(): Locator {
    return this.page.getByText("Failed to load resource");
  }

  async assertUserIsLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL("/login?redirect=%2F");
  }

  async openSelectDairy(): Promise<void> {
    await expect(this.selectDairyControl).toBeVisible();
    await this.selectDairyControl.click();
    await expect(this.dairySearchbox).toBeVisible();
  }

  private get dairyListLink(): (dairyName: string) => Locator {
    return (dairyName: string) => this.page.getByRole("link", { name: dairyName });
  }

  async selectDairy(params: { dairyName: string }): Promise<void> {
    await expect(this.dairyListLink(params.dairyName)).toBeVisible();
    await this.dairyListLink(params.dairyName).click();
  }

  async assertNoErrorToastVisible(): Promise<void> {
    await expect(this.errorToast).toHaveCount(0);
    await expect(this.errorToastText).toHaveCount(0);
  }

  async assertAccessDeniedPageVisible(): Promise<void> {
    await expect(this.accessDeniedHeading).toBeVisible();
    await expect(this.returnHomeButton).toBeVisible();
  }
}
