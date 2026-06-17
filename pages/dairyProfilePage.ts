import { expect, type Locator, type Page } from "@playwright/test";

export class DairyProfilePage {
  constructor(private readonly page: Page) {}

  private get dairyCompMenuItem(): Locator {
    return this.page.getByRole("listitem").filter({ hasText: "DairyComp" });
  }

  private get dairyCompOverviewLink(): Locator {
    return this.page.getByRole("link", { name: "Overview" });
  }

  private get dairyCompAnimalsMenuItem(): Locator {
    return this.page.getByRole("listitem").filter({ hasText: "Animals" });
  }

  private get animalListLink(): Locator {
    return this.page.getByRole("link", { name: "Animal List" });
  }

  private get pen18GridCell(): Locator {
    return this.page.getByRole("gridcell", { name: "18", exact: true });
  }

  private get searchForAnAnimalInput(): Locator {
    return this.page.getByRole("textbox", { name: "Search for an Animal" });
  }

  private get aliveCowId11Option(): Locator {
    return this.page.getByRole("option", { name: "ALIVE COW ID 11 Rpro OK/OPEN Lact 3" });
  }

  async openDairyCompOverview(): Promise<void> {
    await expect(this.dairyCompMenuItem).toBeVisible();
    await expect(this.dairyCompMenuItem).toBeEnabled();
    await this.dairyCompMenuItem.click();

    await expect(this.dairyCompOverviewLink).toBeVisible();
    await expect(this.dairyCompOverviewLink).toBeEnabled();
    await this.dairyCompOverviewLink.click();
  }

  async openAnimalList(): Promise<void> {
    await expect(this.dairyCompAnimalsMenuItem).toBeVisible();
    await expect(this.dairyCompAnimalsMenuItem).toBeEnabled();
    await this.dairyCompAnimalsMenuItem.click();

    await expect(this.animalListLink).toBeVisible();
    await expect(this.animalListLink).toBeEnabled();
    await this.animalListLink.click();
  }

  async openPen18FromAnimalsList(): Promise<void> {
    await expect(this.pen18GridCell).toBeVisible();
    await expect(this.pen18GridCell).toBeEnabled();
    await this.pen18GridCell.click();
  }

  async searchAndOpenCowCardId11(): Promise<void> {
    await expect(this.searchForAnAnimalInput).toBeVisible();
    await this.searchForAnAnimalInput.click();
    await this.searchForAnAnimalInput.pressSequentially("1");

    await expect(this.aliveCowId11Option).toBeVisible();
    await this.aliveCowId11Option.click();
  }
}
