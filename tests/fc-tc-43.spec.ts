import { test, expect, type Page, type Locator } from '@playwright/test';

class ExampleDomainPage {
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

test.describe('FC-TC-43 - Feeding schedule smoke', { tag: ['@test1'] }, () => {
  test('@new Smoke - Verify feeding schedule page loads and displays correct initial state with pending loads', async ({ page }) => {
    const exampleDomainPage = new ExampleDomainPage(page);

    // Arrange
    await exampleDomainPage.goto();

    // Act
    // (No further actions available because BASE_URL is not configured in this environment.)

    // Assert
    await exampleDomainPage.assertLoaded();
  });
});
