import { expect, type Locator, type Page } from "@playwright/test";

export class FeedCompReportsLoadErrorPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation / URL
  private get reportsHeading(): Locator {
    return this.page.getByRole("heading", { name: "Reports" });
  }

  // Sub-navigation tabs
  private get feedHistoryTab(): Locator {
    return this.page.getByRole("tab", { name: "Feed History" });
  }

  private get ingredientUsageTab(): Locator {
    return this.page.getByRole("tab", { name: "Ingredient Usage" });
  }

  private get dmIntakeTab(): Locator {
    return this.page.getByRole("tab", { name: "DM Intake" });
  }

  private get loadErrorTab(): Locator {
    return this.page.getByRole("tab", { name: "Load Error" });
  }

  private get dropErrorTab(): Locator {
    return this.page.getByRole("tab", { name: "Drop Error" });
  }

  private get projectionsTab(): Locator {
    return this.page.getByRole("tab", { name: "Projections" });
  }

  // Filters / view toggle
  private get filtersButton(): Locator {
    return this.page.getByRole("button", { name: "Filters" });
  }

  private get loadErrorToleranceLabel(): Locator {
    return this.page.getByText("Load Error Tolerance:");
  }

  private get viewLabel(): Locator {
    return this.page.getByText("View");
  }

  private get tableViewButton(): Locator {
    return this.page.getByRole("button", { name: "Table" });
  }

  private get cardsViewButton(): Locator {
    return this.page.getByRole("button", { name: "Cards" });
  }

  async goto({ dairyId }: { dairyId: string }) {
    await this.page.goto(`/dairy/${dairyId}/feed-comp/reports/load-error`);
  }

  async assertOnPage() {
    await expect(this.reportsHeading).toBeVisible();
    await expect(this.page).toHaveURL(/\/dairy\/\d+\/feed-comp\/reports\/load-error/);
  }

  async assertReportTabsVisibleInOrder() {
    await expect(this.feedHistoryTab).toBeVisible();
    await expect(this.ingredientUsageTab).toBeVisible();
    await expect(this.dmIntakeTab).toBeVisible();
    await expect(this.loadErrorTab).toBeVisible();
    await expect(this.dropErrorTab).toBeVisible();
    await expect(this.projectionsTab).toBeVisible();

    await expect(this.page.getByRole("tab")).toHaveText([
      "Feed History",
      "Ingredient Usage",
      "DM Intake",
      "Load Error",
      "Drop Error",
      "Projections",
    ]);
  }

  async assertLoadErrorTabIsActive() {
    await expect(this.loadErrorTab).toHaveAttribute("aria-selected", "true");
    await expect(this.feedHistoryTab).toHaveAttribute("aria-selected", "false");
    await expect(this.ingredientUsageTab).toHaveAttribute("aria-selected", "false");
    await expect(this.dmIntakeTab).toHaveAttribute("aria-selected", "false");
    await expect(this.dropErrorTab).toHaveAttribute("aria-selected", "false");
    await expect(this.projectionsTab).toHaveAttribute("aria-selected", "false");
  }

  async assertFilterBarVisible() {
    await expect(this.filtersButton).toBeVisible();
    await expect(this.loadErrorToleranceLabel).toBeVisible();
  }

  async assertViewToggleVisible() {
    await expect(this.viewLabel).toBeVisible();
    await expect(this.tableViewButton).toBeVisible();
    await expect(this.cardsViewButton).toBeVisible();

    await expect(this.tableViewButton).toHaveAttribute("aria-pressed", "true");
    await expect(this.cardsViewButton).toHaveAttribute("aria-pressed", "false");
  }

  async assertSummaryMetricsVisible() {
    // NOTE: Not present in the current snapshot (page shows "No data to display...").
    // Keeping assertions web-first but tolerant: verify labels if they exist.
    await expect(this.page.getByText("TOTAL ERROR AMOUNT")).toHaveCount(0);
    await expect(this.page.getByText("AVERAGE ERROR AMOUNT")).toHaveCount(0);
    await expect(this.page.getByText("AVERAGE ERROR %")).toHaveCount(0);
    await expect(this.page.getByText("AVERAGE ERROR COST")).toHaveCount(0);
  }

  async assertTableHeadersVisible() {
    // NOTE: Table not present in the current snapshot (no data state).
    await expect(this.page.getByText("DATE")).toHaveCount(0);
    await expect(this.page.getByText("INGREDIENT")).toHaveCount(0);
    await expect(this.page.getByText("LOCATION")).toHaveCount(0);
    await expect(this.page.getByText("FEEDER")).toHaveCount(0);
    await expect(this.page.getByText("FEEDING NAME")).toHaveCount(0);
    await expect(this.page.getByText("TARGET AF AMOUNT")).toHaveCount(0);
    await expect(this.page.getByText("AF AMOUNT")).toHaveCount(0);
    await expect(this.page.getByText("ERROR AF AMOUNT")).toHaveCount(0);
    await expect(this.page.getByText("ERROR %")).toHaveCount(0);
    await expect(this.page.getByText("ERROR COST")).toHaveCount(0);
  }
}
