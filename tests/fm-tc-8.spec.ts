import { test, expect, type Page, type Locator } from '@playwright/test';

class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async loginIfPresent(): Promise<void> {
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    const usernameInput = this.page
      .getByLabel(/username|email/i)
      .or(this.page.getByPlaceholder(/username|email/i));
    const passwordInput = this.page
      .getByLabel(/password/i)
      .or(this.page.getByPlaceholder(/password/i));
    const signInButton = this.page.getByRole('button', { name: /sign in|log in/i });

    const loginVisible = await usernameInput
      .first()
      .isVisible()
      .catch(() => false);

    if (!loginVisible) return;

    if (!username || !password) {
      throw new Error(
        'Login screen detected but credentials are missing. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).'
      );
    }

    await expect(usernameInput.first()).toBeVisible();
    await usernameInput.first().fill(username);
    await expect(passwordInput.first()).toBeVisible();
    await passwordInput.first().fill(password);

    await expect(signInButton).toBeVisible();
    await signInButton.click();

    await expect(usernameInput.first()).toBeHidden({ timeout: 30000 });
  }
}

class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectDairyIfPresent(): Promise<void> {
    const dairyButton = this.page
      .getByRole('button', { name: /art automation icon holsteins/i })
      .or(this.page.getByText(/art automation icon holsteins/i));

    if (await dairyButton.first().isVisible().catch(() => false)) {
      await dairyButton.first().click();
    }
  }
}

class FeedingSchedulePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page
      .getByRole('heading', { name: /feeding schedule/i })
      .or(page.getByText(/feeding schedule/i));
  }

  async openFromNav(): Promise<void> {
    // Some builds expose Feeding Schedule in a side menu / hamburger.
    const scheduleNav = this.page
      .getByRole('link', { name: /feeding schedule/i })
      .or(this.page.getByRole('button', { name: /feeding schedule/i }))
      .or(this.page.getByText(/feeding schedule/i));

    const hamburger = this.page
      .getByRole('button', { name: /menu|navigation|open menu|hamburger/i })
      .or(this.page.getByLabel(/menu|navigation/i))
      .or(this.page.getByRole('button', { name: /☰/ }));

    if (!(await scheduleNav.first().isVisible().catch(() => false))) {
      if (await hamburger.first().isVisible().catch(() => false)) {
        await hamburger.first().click();
      }
    }

    await expect(scheduleNav.first()).toBeVisible({ timeout: 30000 });
    await scheduleNav.first().click();
    await expect(this.heading.first()).toBeVisible({ timeout: 30000 });
  }

  async openTestSchedule(): Promise<void> {
    const scheduleRow = this.page
      .getByRole('button')
      .filter({ hasText: /mix/i })
      .or(this.page.getByText(/mix with 3 ingredients,? 2 pens/i));

    await expect(scheduleRow.first()).toBeVisible({ timeout: 30000 });
    await scheduleRow.first().click();
  }
}

class FeedingDetailPage {
  readonly page: Page;
  readonly startMixButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startMixButton = page.getByRole('button', { name: /start mix/i });
  }

  async startMix(): Promise<void> {
    await expect(this.startMixButton).toBeVisible({ timeout: 30000 });
    await this.startMixButton.click();
  }
}

class PickupPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectVisible(): Promise<void> {
    await expect(this.page.getByText(/pickup/i)).toBeVisible({ timeout: 30000 });
  }

  private amountInput(): Locator {
    return this.page
      .getByLabel(/amount|loaded|weight/i)
      .or(this.page.getByPlaceholder(/amount|weight/i))
      .or(this.page.locator('input[type="number"], input[inputmode="numeric"], input[type="tel"]').first());
  }

  async loadIngredient(expected: number, actual: number): Promise<void> {
    const ingredientCard = this.page.getByText(new RegExp(`\b${expected}\b`)).first();
    if (await ingredientCard.isVisible().catch(() => false)) {
      await ingredientCard.click();
    }

    const input = this.amountInput();
    await expect(input).toBeVisible({ timeout: 30000 });
    await input.fill(String(actual));

    const saveButton = this.page.getByRole('button', { name: /save|done|ok|confirm|accept/i });
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click();
    }

    const overloadAck = this.page.getByRole('button', { name: /ack|acknowledge|accept|ok/i });
    if (await overloadAck.isVisible().catch(() => false)) {
      await overloadAck.click();
    }

    await expect(this.page.getByText(new RegExp(`\b${actual}\b`))).toBeVisible({ timeout: 30000 });
  }

  async acknowledgeSmallAmount(expected: number): Promise<void> {
    const ingredientCard = this.page.getByText(new RegExp(`\b${expected}\b`)).first();
    if (await ingredientCard.isVisible().catch(() => false)) {
      await ingredientCard.click();
    }

    const ackButton = this.page.getByRole('button', { name: /^ack$/i }).or(this.page.getByRole('button', { name: /acknowledge/i }));
    await expect(ackButton.first()).toBeVisible({ timeout: 30000 });
    await ackButton.first().click();
  }

  async goToDropPhase(): Promise<void> {
    const dropTab = this.page.getByRole('button', { name: /drop/i }).or(this.page.getByRole('tab', { name: /drop/i }));
    await expect(dropTab.first()).toBeVisible({ timeout: 30000 });
    await dropTab.first().click();
    await expect(this.page.getByText(/drop/i)).toBeVisible({ timeout: 30000 });
  }
}

class DropPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private amountInput(): Locator {
    return this.page
      .getByLabel(/drop|delivered|amount|weight/i)
      .or(this.page.getByPlaceholder(/drop|delivered|amount|weight/i))
      .or(this.page.locator('input[type="number"], input[inputmode="numeric"], input[type="tel"]').first());
  }

  async dropToPen(penName: string, expected: number, actual: number): Promise<void> {
    const penSelector = this.page
      .getByRole('button', { name: new RegExp(penName, 'i') })
      .or(this.page.getByText(new RegExp(penName, 'i')));

    if (await penSelector.first().isVisible().catch(() => false)) {
      await penSelector.first().click();
    }

    await expect(this.page.getByText(new RegExp(`\b${expected}\b`))).toBeVisible({ timeout: 30000 });

    const input = this.amountInput();
    await expect(input).toBeVisible({ timeout: 30000 });
    await input.fill(String(actual));

    const recordButton = this.page.getByRole('button', { name: /record|done|save|ok|confirm/i });
    if (await recordButton.isVisible().catch(() => false)) {
      await recordButton.click();
    }

    await expect(this.page.getByText(new RegExp(`\b${actual}\b`))).toBeVisible({ timeout: 30000 });
  }

  async expectRemaining(remaining: number): Promise<void> {
    await expect(this.page.getByText(new RegExp(`remaining\s*${remaining}`, 'i'))).toBeVisible({ timeout: 30000 });
  }

  async continueToComplete(): Promise<void> {
    const continueButton = this.page.getByRole('button', { name: /continue|complete|done|finish/i });
    await expect(continueButton).toBeVisible({ timeout: 30000 });
    await continueButton.click();
  }
}

class FeedingHistoryReportsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openFromNav(): Promise<void> {
    const nav = this.page
      .getByRole('link', { name: /feeding history|reports/i })
      .or(this.page.getByRole('button', { name: /feeding history|reports/i }))
      .or(this.page.getByText(/feeding history|reports/i));

    await expect(nav.first()).toBeVisible({ timeout: 30000 });
    await nav.first().click();

    const heading = this.page
      .getByRole('heading', { name: /feeding history|reports/i })
      .or(this.page.getByText(/feeding history|reports/i));
    await expect(heading.first()).toBeVisible({ timeout: 30000 });
  }

  async openMostRecentCompletedFeeding(): Promise<void> {
    const completedRow = this.page.getByRole('row').filter({ hasText: /completed|done/i }).first();
    if (await completedRow.isVisible().catch(() => false)) {
      await completedRow.click();
      return;
    }

    const fallback = this.page.getByText(/completed|done/i).first();
    await expect(fallback).toBeVisible({ timeout: 30000 });
    await fallback.click();
  }

  async expectPenTotalDropError(penLabel: string, expectedError: number): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: new RegExp(penLabel, 'i') }).first();
    await expect(row).toBeVisible({ timeout: 30000 });

    await expect(row.getByText(new RegExp(`\+?${expectedError}\b`))).toBeVisible({ timeout: 30000 });

    // Regression guard (FED-3334): error must not equal full actual drop.
    await expect(row.getByText(/\b1074\b|\b2140\b/)).not.toBeVisible();
  }

  async expectOverallTotals(totalActualDrop: number, totalDropError: number): Promise<void> {
    await expect(this.page.getByText(new RegExp(`total actual drop\s*${totalActualDrop}`, 'i'))).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(new RegExp(`total drop error\s*\+?${totalDropError}`, 'i'))).toBeVisible({ timeout: 30000 });
  }
}

test.describe('FM-TC-8: Total Drop Error calculation after simple feeding schedule', { tag: '@test2' }, () => {
  test('calculates per-pen and overall Total Drop Error without redistributing ACK remainder', async ({ page }) => {
    // Arrange
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL;
    if (baseURL) {
      await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    }

    const login = new LoginPage(page);
    const home = new HomePage(page);
    const schedule = new FeedingSchedulePage(page);
    const detail = new FeedingDetailPage(page);
    const pickup = new PickupPage(page);
    const drop = new DropPage(page);
    const reports = new FeedingHistoryReportsPage(page);

    // Act
    await login.loginIfPresent();
    await home.selectDairyIfPresent();

    await schedule.openFromNav();
    await schedule.openTestSchedule();

    await detail.startMix();
    await pickup.expectVisible();

    await pickup.loadIngredient(1452, 1460);
    await pickup.loadIngredient(1452, 1470);
    await pickup.acknowledgeSmallAmount(290);

    await pickup.goToDropPhase();

    await drop.dropToPen('Pen 1', 1065, 1074);
    await drop.dropToPen('Pen 2', 2129, 2140);
    await drop.expectRemaining(290);
    await drop.continueToComplete();

    // Assert
    await reports.openFromNav();
    await reports.openMostRecentCompletedFeeding();

    await reports.expectPenTotalDropError('Pen 1', 9);
    await reports.expectPenTotalDropError('Pen 2', 11);
    await reports.expectOverallTotals(3214, 20);
  });
});
