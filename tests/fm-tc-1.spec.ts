import { test, expect, type Page, type Locator } from '@playwright/test';

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
    // Prefer a semantic list/grid item; fall back to first visible button that looks like a user.
    const userCandidate = this.page
      .getByRole('button')
      .filter({ hasText: /.+/ })
      .first();

    await expect(userCandidate).toBeVisible();
    await userCandidate.click();
  }
}

class EnterPinPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly pinInput: Locator;
  readonly confirmButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /enter pin|pin/i });

    // Common patterns: a single masked input, or multiple digit inputs.
    this.pinInput = page
      .getByLabel(/pin/i)
      .or(page.getByPlaceholder(/pin/i))
      .or(page.locator('input[type="password"], input[inputmode="numeric"], input[type="tel"]').filter({ has: page.locator(':visible') }));

    this.confirmButton = page.getByRole('button', { name: /confirm|login|log in|sign in|continue|submit/i });
    this.errorMessage = page.getByText(/incorrect pin|invalid pin|pin is incorrect|wrong pin|try again/i);
  }

  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    // At least one PIN input should be visible.
    await expect(this.page.locator('input')).toBeVisible();
  }

  async enterIncorrectPin(pin: string): Promise<void> {
    // Try single input first.
    const single = this.pinInput.first();
    if (await single.isVisible().catch(() => false)) {
      await single.fill(pin);
      return;
    }

    // Fallback: multiple digit inputs.
    const digitInputs = this.page.locator('input').filter({ hasNotText: /./ });
    const count = await digitInputs.count();
    expect(count).toBeGreaterThan(0);

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
  }
}

test.describe('FM-TC-1: Incorrect PIN rejected in offline mode', () => {
  test('rejects incorrect PIN on Enter PIN page while offline', async ({ page, context }) => {
    // Arrange
    // Note: This test assumes the app is already in the post-force-close state and offline mode
    // per testcase preconditions. We still enforce offline at the browser level for determinism.
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL;
    if (baseURL) {
      // Navigate while online to allow the app shell to load, then switch offline to simulate
      // the testcase precondition (device offline after force-close/reopen).
      await context.setOffline(false);
      await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
      await context.setOffline(true);
    } else {
      // If the runner already provides a loaded page (e.g., via storageState), just enforce offline.
      await context.setOffline(true);
    }

    const userSelection = new UserSelectionPage(page);
    const enterPin = new EnterPinPage(page);

    // Act
    await userSelection.expectVisible();
    await userSelection.selectAnyUser();

    await enterPin.expectVisible();
    await enterPin.enterIncorrectPin('0000');
    await enterPin.submit();

    // Assert
    await enterPin.expectIncorrectPinError();

    // Ensure we did not log in (stay on Enter PIN page).
    await expect(enterPin.heading).toBeVisible();

    // Security rule compliance: do not use credentials here.
    // (Env vars reserved for flows that require username/password.)
    void process.env.TEST_USERNAME;
    void process.env.TEST_PASSWORD;
    void process.env.APP_USERNAME;
    void process.env.APP_PASSWORD;
  });
});
