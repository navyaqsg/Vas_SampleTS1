import { expect, type Locator, type Page } from "@playwright/test";

export class FeedCompPensPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/dairy/34858/pens/list?from=feedComp");
  }

  private get pageHeading(): Locator {
    return this.page.getByRole("heading", { name: "Pens" });
  }

  private get pensGrid(): Locator {
    return this.page.getByRole("grid");
  }

  private get firstDataRow(): Locator {
    return this.pensGrid.getByRole("row").nth(1);
  }

  private get secondDataRow(): Locator {
    return this.pensGrid.getByRole("row").nth(2);
  }

  private get thirdDataRow(): Locator {
    return this.pensGrid.getByRole("row").nth(3);
  }

  private get activeCellInRow(): (row: Locator) => Locator {
    return (row: Locator) => row.getByRole("gridcell").nth(9);
  }

  private get bulkEditDrawer(): Locator {
    return this.page.getByRole("complementary");
  }

  private get activeFieldText(): Locator {
    return this.page.getByText("Active", { exact: true });
  }

  private get typeFieldText(): Locator {
    return this.page.getByText("Type", { exact: true });
  }

  private get zoneFieldText(): Locator {
    return this.page.getByText("Zone", { exact: true });
  }

  private get capacityFieldText(): Locator {
    return this.page.getByText("Capacity", { exact: true });
  }

  private get feedingCountFieldText(): Locator {
    return this.page.getByText("Feeding Count", { exact: true });
  }

  private get targetDmHdFieldText(): Locator {
    return this.page.getByText("Target DM/HD", { exact: true });
  }

  private get targetAfFieldText(): Locator {
    return this.page.getByText("Target AF", { exact: true });
  }

  private get dmAdjustmentFieldText(): Locator {
    return this.page.getByText("DM Adjustment (%)", { exact: true });
  }

  private get syncFeedingAndAnimalCountFieldText(): Locator {
    return this.page.getByText("Sync feeding & animal count", { exact: true });
  }

  private get enabledForFeedingFieldText(): Locator {
    return this.page.getByText("Enabled for Feeding", { exact: true });
  }

  async assertOnPensPage() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.pensGrid).toBeVisible();
  }

  async selectThreePens() {
    await expect(this.firstDataRow).toBeVisible();
    await expect(this.secondDataRow).toBeVisible();
    await expect(this.thirdDataRow).toBeVisible();

    await this.activeCellInRow(this.firstDataRow).click();
    await this.activeCellInRow(this.secondDataRow).click();
    await this.activeCellInRow(this.thirdDataRow).click();
  }

  async openBulkEditDrawer() {
    // NOTE: The UI in the current snapshot does not expose an "Edit selected pens" button.
    // This method is intentionally left as a placeholder until the correct control is observed.
    await expect(this.pageHeading).toBeVisible();
  }

  async assertBulkEditDrawerFieldsForNonFeedCompDairy() {
    await expect(this.bulkEditDrawer).toBeVisible();

    await expect(this.activeFieldText).toBeVisible();
    await expect(this.typeFieldText).toBeVisible();
    await expect(this.zoneFieldText).toBeVisible();
    await expect(this.capacityFieldText).toBeVisible();

    await expect(this.feedingCountFieldText).toHaveCount(0);
    await expect(this.targetDmHdFieldText).toHaveCount(0);
    await expect(this.targetAfFieldText).toHaveCount(0);
    await expect(this.dmAdjustmentFieldText).toHaveCount(0);
    await expect(this.syncFeedingAndAnimalCountFieldText).toHaveCount(0);
    await expect(this.enabledForFeedingFieldText).toHaveCount(0);
  }
}
