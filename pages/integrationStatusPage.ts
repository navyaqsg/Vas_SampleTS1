import { expect, type Locator, type Page } from "@playwright/test";

export class IntegrationStatusPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/dairy/34858/integration-status/default-zone");
  }

  private get pageHeading(): Locator {
    return this.page.getByRole("heading", { name: "Integration Status" });
  }

  private get breadcrumbDairyLink(): Locator {
    return this.page.getByRole("link", { name: "Dairy" });
  }

  private get breadcrumbCurrentPage(): Locator {
    return this.page.getByText("Integration Status");
  }

  private get defaultZoneTab(): Locator {
    return this.page.getByRole("tab", { name: "Default Zone" });
  }

  private get dairyCompCardHeader(): Locator {
    return this.page.getByText("DairyComp");
  }

  private get feedCompCardHeader(): Locator {
    return this.page.getByText("FeedComp");
  }

  private get weighCompCardHeader(): Locator {
    return this.page.getByText("WeighComp");
  }

  private get needHelpLink(): Locator {
    return this.page.getByRole("link", { name: "Need help with Integration Status?" });
  }

  async assertOnIntegrationStatusPage(): Promise<void> {
    await expect(this.page).toHaveURL("/dairy/34858/integration-status/default-zone");
  }

  async assertPageTitleVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async assertBreadcrumbContainsDairyAndIntegrationStatus(): Promise<void> {
    await expect(this.breadcrumbDairyLink).toBeVisible();
    await expect(this.breadcrumbCurrentPage).toBeVisible();
  }

  async assertDefaultZoneTabIsActive(): Promise<void> {
    await expect(this.defaultZoneTab).toHaveAttribute("aria-selected", "true");
  }

  async assertIntegrationCardsVisible(): Promise<void> {
    await expect(this.dairyCompCardHeader).toBeVisible();
    await expect(this.feedCompCardHeader).toBeVisible();
    await expect(this.weighCompCardHeader).toBeVisible();
  }

  async assertNeedHelpLinkVisible(): Promise<void> {
    await expect(this.needHelpLink).toBeVisible();
  }
}
