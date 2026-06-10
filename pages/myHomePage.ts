import { expect, type Locator, type Page } from "@playwright/test";

export class MyHomePage {
  constructor(private readonly page: Page) {}

  private get selectDairyControl(): Locator {
    return this.page.getByText("Select a Dairy");
  }

  private get artAutomationIconHolsteinsDairyLink(): Locator {
    return this.page.getByRole("link", { name: "ART Automation Icon Holsteins" });
  }

  async openDairySelector(): Promise<void> {
    await expect(this.selectDairyControl).toBeVisible();
    await this.selectDairyControl.click();
  }

  async selectArtAutomationIconHolsteins(): Promise<void> {
    await expect(this.artAutomationIconHolsteinsDairyLink).toBeVisible();
    await this.artAutomationIconHolsteinsDairyLink.click();
  }
}
