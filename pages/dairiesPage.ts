import { expect, type APIResponse, type Locator, type Page } from "@playwright/test";
import type { DairiesSearchParams } from "../types/dairies.types";

export class DairiesPage {
  constructor(private readonly page: Page) {}

  private get searchInput(): Locator {
    return this.page.getByRole("searchbox");
  }

  private get mainContent(): Locator {
    return this.page.getByRole("main");
  }

  private get imagesInMainContent(): Locator {
    return this.mainContent.getByRole("img");
  }

  async goto(): Promise<void> {
    await this.page.goto("/genetics/alta/dairies");
  }

  async assertOnDairiesPage(): Promise<void> {
    await expect(this.page).toHaveURL("/genetics/alta/dairies");
    await expect(this.searchInput).toBeVisible();
  }

  async search(params: Pick<DairiesSearchParams, "term">): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await this.searchInput.fill(params.term);
  }

  async waitForDairiesSearchResponse(params: Pick<DairiesSearchParams, "expectedStatus">): Promise<APIResponse> {
    const response = await this.page.waitForResponse((r) => {
      return r.request().method() === "GET" && r.url().includes("/dairies");
    });

    await expect(response).toBeOK();
    expect(response.status()).toBe(params.expectedStatus);
    return response;
  }

  async assertResultsVisible(): Promise<void> {
    await expect(this.mainContent).toBeVisible();
  }

  async assertNoBrokenImagesInMainContent(): Promise<void> {
    const imageCount = await this.imagesInMainContent.count();

    for (let i = 0; i < imageCount; i++) {
      const img = this.imagesInMainContent.nth(i);
      await expect(img).toBeVisible();

      const isBroken = await img.evaluate((el) => {
        const image = el as HTMLImageElement;
        return !image.complete || image.naturalWidth === 0;
      });

      expect(isBroken).toBeFalsy();
    }
  }
}
