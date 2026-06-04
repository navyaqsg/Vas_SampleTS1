import { test, expect, type Locator, type Page } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email *' });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password *' });
  }

  private get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  async goto(): Promise<void> {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL;
    if (!baseURL) throw new Error('Missing base URL. Set PLAYWRIGHT_BASE_URL or BASE_URL.');
    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  }

  async login(): Promise<void> {
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(username);

    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);

    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
  }
}

class CowCardPage {
  constructor(private readonly page: Page) {}

  // Placeholder locators: must be replaced after live inspection of the real app.
  private get ellipsisButton(): Locator {
    return this.page.getByRole('button', { name: '...' });
  }

  private get markAsSoldDiedOption(): Locator {
    return this.page.getByRole('menuitem', { name: 'Mark as Sold/Died' });
  }

  private get deleteAnimalOption(): Locator {
    return this.page.getByRole('menuitem', { name: 'Delete Animal' });
  }

  private get dropdownMenu(): Locator {
    return this.page.getByRole('menu');
  }

  private get neutralPageArea(): Locator {
    return this.page.getByRole('main');
  }

  async openEllipsisMenu(): Promise<void> {
    await expect(this.ellipsisButton).toBeVisible();
    await expect(this.ellipsisButton).toBeEnabled();
    await this.ellipsisButton.click();
  }

  async assertEllipsisMenuOpen(): Promise<void> {
    await expect(this.dropdownMenu).toBeVisible();
    await expect(this.markAsSoldDiedOption).toBeVisible();
    await expect(this.deleteAnimalOption).toBeVisible();
  }

  async clickOutsideMenu(): Promise<void> {
    await expect(this.neutralPageArea).toBeVisible();
    await this.neutralPageArea.click({ position: { x: 5, y: 5 } });
  }

  async assertEllipsisMenuClosed(): Promise<void> {
    await expect(this.dropdownMenu).toBeHidden();
  }
}

test.describe('FC-TC-44: CowCard - Ellipsis dropdown closes on outside click', { tag: '@test1' }, () => {
  test('ellipsis dropdown closes when clicking outside the menu on CowCard', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const cowCardPage = new CowCardPage(page);

    await loginPage.goto();

    // Act
    await loginPage.login();

    // NOTE: The remaining steps (select dairy, navigate to Animals, open CowCard)
    // require the real application under BASE_URL. The current repo baseURL points
    // to OrangeHRM demo, which does not contain these flows.

    // Act
    await cowCardPage.openEllipsisMenu();

    // Assert
    await cowCardPage.assertEllipsisMenuOpen();

    // Act
    await cowCardPage.clickOutsideMenu();

    // Assert
    await cowCardPage.assertEllipsisMenuClosed();
  });
});
