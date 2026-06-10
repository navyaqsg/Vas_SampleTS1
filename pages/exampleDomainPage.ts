import { expect, type Locator, type Page } from '@playwright/test';

export class ExampleDomainPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: 'Example Domain' });
  }

  private get learnMoreLink(): Locator {
    return this.page.getByRole('link', { name: 'Learn more' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://example.com/');
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('https://example.com/');
    await expect(this.heading).toBeVisible();
    await expect(this.learnMoreLink).toBeVisible();
  }
}
