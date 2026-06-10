import { expect, type Locator, type Page } from "@playwright/test";

export class DairyProfilePage {
  constructor(private readonly page: Page) {}

  private get searchForAnAnimalInput(): Locator {
    return this.page.getByRole("textbox", { name: "Search for an Animal" });
  }

  private get aliveCowId11Option(): Locator {
    return this.page.getByRole("option", { name: "ALIVE COW ID 11 Rpro OK/OPEN Lact 3" });
  }

  async searchAndOpenCowCardId11(): Promise<void> {
    await expect(this.searchForAnAnimalInput).toBeVisible();
    await this.searchForAnAnimalInput.click();
    await this.searchForAnAnimalInput.pressSequentially("1");

    await expect(this.aliveCowId11Option).toBeVisible();
    await this.aliveCowId11Option.click();
  }
}
