import { test, expect, type Page, type Locator } from '@playwright/test';

class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly signIn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByLabel(/username|email/i).or(page.getByPlaceholder(/username|email/i));
    this.password = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
    this.signIn = page.getByRole('button', { name: /sign in|log in|login/i });
  }

  async login(username: string, password: string): Promise<void> {
    await expect(this.username).toBeVisible();
    await this.username.fill(username);
    await expect(this.password).toBeVisible();
    await this.password.fill(password);
    await expect(this.signIn).toBeVisible();
    await this.signIn.click();
  }
}

class DairySelectionPage {
  readonly page: Page;
  readonly selectDairy: Locator;

  constructor(page: Page) {
    this.page = page;
    this.selectDairy = page.getByRole('button', { name: /select a dairy/i }).or(page.getByText(/select a dairy/i));
  }

  async selectArtAutomationIconHolsteins(): Promise<void> {
    await expect(this.selectDairy).toBeVisible();
    await this.selectDairy.click();

    const dairyOption = this.page
      .getByRole('button', { name: /art automation icon holsteins/i })
      .or(this.page.getByText(/art automation icon holsteins/i));

    await expect(dairyOption).toBeVisible();
    await dairyOption.click();
  }
}

class UserSelectionPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /select user|choose user|users/i });
  }

  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async selectAnyUser(): Promise<void> {
    const userCandidate = this.page.getByRole('button').filter({ hasText: /.+/ }).first();
    await expect(userCandidate).toBeVisible();
    await userCandidate.click();
  }
}

class EnterPinPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly confirmButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /enter pin|pin/i });
    this.confirmButton = page.getByRole('button', { name: /confirm|login|log in|sign in|continue|submit/i });
    this.errorMessage = page.getByText(/incorrect pin|invalid pin|pin is incorrect|wrong pin|try again/i);
  }

  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.page.locator('input')).toBeVisible();
  }

  async enterPin(pin: string): Promise<void> {
    const labeled = this.page.getByLabel(/pin/i).or(this.page.getByPlaceholder(/pin/i));
    if (await labeled.first().isVisible().catch(() => false)) {
      await labeled.first().fill(pin);
      return;
    }

    const digitInputs = this.page.locator('input[type="password"], input[inputmode="numeric"], input[type="tel"], input').filter({ has: this.page.locator(':visible') });
    const count = await digitInputs.count();
    expect(count).toBeGreaterThan(0);

    if (count === 1) {
      await digitInputs.first().fill(pin);
      return;
    }

    for (let i = 0; i < Math.min(pin.length, count); i++) {
      await digitInputs.nth(i).fill(pin[i] ?? '0');
    }
  }

  async submit(): Promise<void> {
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();
  }

  async expectIncorrectPinError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.heading).toBeVisible();
  }
}

test.describe('FM-TC-1: Incorrect PIN rejected in offline mode', { tag: '@test1' }, () => {
  test('rejects incorrect PIN on Enter PIN page while offline', async ({ page, context }) => {
    // Arrange
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL;
    if (!baseURL) throw new Error('Missing base URL. Set PLAYWRIGHT_BASE_URL or BASE_URL.');

    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;
    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    await context.setOffline(false);
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    const loginPage = new LoginPage(page);
    const dairySelection = new DairySelectionPage(page);

    // Act: login and select dairy while online
    await loginPage.login(username, password);
    await dairySelection.selectArtAutomationIconHolsteins();

    // Simulate force-close/reopen by creating a new page in the same context.
    // Then enforce offline mode as per precondition.
    // Go offline AFTER the app is loaded so navigation doesn't fail with ERR_INTERNET_DISCONNECTED.
    // This keeps the same intent: app is reopened and then used while offline.
    await page.close();
    const offlinePage = await context.newPage();
    await offlinePage.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await context.setOffline(true);

    const userSelection = new UserSelectionPage(offlinePage);
    const enterPin = new EnterPinPage(offlinePage);

    // Act: select user and enter incorrect PIN
    await userSelection.expectVisible();
    await userSelection.selectAnyUser();

    await enterPin.expectVisible();
    await enterPin.enterPin('0000');
    await enterPin.submit();

    // Assert
    await enterPin.expectIncorrectPinError();
  });
});
