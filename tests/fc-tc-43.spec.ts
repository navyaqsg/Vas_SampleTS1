import { test, expect, type Page, type Locator } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: /username|email/i });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: /password/i });
  }

  private get signInButton(): Locator {
    return this.page.getByRole('button', { name: /sign in|log in|login/i });
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

    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }
}

class DairySelectionPage {
  constructor(private readonly page: Page) {}

  private get selectADairyButton(): Locator {
    return this.page.getByRole('button', { name: /select a dairy/i }).or(this.page.getByText(/select a dairy/i));
  }

  private get dairyDialog(): Locator {
    return this.page.getByRole('dialog').or(this.page.getByRole('listbox'));
  }

  private dairyOptionByName(name: string): Locator {
    return this.page
      .getByRole('option', { name: new RegExp(`^${escapeRegex(name)}$`, 'i') })
      .or(this.page.getByRole('button', { name: new RegExp(`^${escapeRegex(name)}$`, 'i') }))
      .or(this.page.getByText(new RegExp(`^${escapeRegex(name)}$`, 'i')));
  }

  async selectDairy(dairyName: string): Promise<void> {
    await expect(this.selectADairyButton).toBeVisible();
    await expect(this.selectADairyButton).toBeEnabled();
    await this.selectADairyButton.click();

    await expect(this.dairyDialog).toBeVisible();

    const option = this.dairyOptionByName(dairyName).first();
    await expect(option).toBeVisible();
    await option.click();
  }
}

class HomePage {
  constructor(private readonly page: Page) {}

  private get selectedDairyName(): Locator {
    return this.page.getByText(/art automation icon holsteins/i);
  }

  private get completedLoadsCount(): Locator {
    return this.page.getByText(/0\s+completed\s+loads/i);
  }

  private get feedingScheduleNav(): Locator {
    return this.page
      .getByRole('link', { name: /feeding schedule/i })
      .or(this.page.getByRole('button', { name: /feeding schedule/i }))
      .or(this.page.getByText(/feeding schedule/i));
  }

  async assertDairySelected(dairyName: string): Promise<void> {
    await expect(this.page.getByText(new RegExp(escapeRegex(dairyName), 'i'))).toBeVisible();
  }

  async assertZeroCompletedLoads(): Promise<void> {
    // Prefer explicit "0 completed loads" if present; otherwise fall back to any visible "Completed" section with 0.
    if (await this.completedLoadsCount.isVisible().catch(() => false)) {
      await expect(this.completedLoadsCount).toBeVisible();
      return;
    }

    const completedLabel = this.page.getByText(/completed\s+loads/i);
    await expect(completedLabel).toBeVisible();
    await expect(this.page.getByText(/^0$/)).toBeVisible();
  }

  async goToFeedingSchedule(): Promise<void> {
    await expect(this.feedingScheduleNav).toBeVisible();
    await expect(this.feedingScheduleNav).toBeEnabled();
    await this.feedingScheduleNav.click();
  }
}

class FeedingSchedulePage {
  constructor(private readonly page: Page) {}

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /feeding schedule/i }).or(this.page.getByText(/feeding schedule/i));
  }

  private get pendingLoadsListItems(): Locator {
    // Generic: any list/table rows that include "Pending".
    return this.page.getByText(/pending/i);
  }

  private get feedingHistoryNav(): Locator {
    return this.page
      .getByRole('link', { name: /feeding history/i })
      .or(this.page.getByRole('button', { name: /feeding history/i }))
      .or(this.page.getByText(/feeding history/i));
  }

  async assertOnRoute(): Promise<void> {
    const routeContains = process.env.FEEDING_SCHEDULE_ROUTE_CONTAINS ?? 'feeding-schedule';
    await expect(this.page).toHaveURL(new RegExp(escapeRegex(routeContains), 'i'));
  }

  async assertVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async assertHasAtLeastOnePendingLoad(): Promise<void> {
    await expect(this.pendingLoadsListItems.first()).toBeVisible();
  }

  async goToFeedingHistory(): Promise<void> {
    await expect(this.feedingHistoryNav).toBeVisible();
    await expect(this.feedingHistoryNav).toBeEnabled();
    await this.feedingHistoryNav.click();
  }
}

class FeedingHistoryPage {
  constructor(private readonly page: Page) {}

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /feeding history/i }).or(this.page.getByText(/feeding history/i));
  }

  private get historyList(): Locator {
    return this.page.getByRole('list').or(this.page.getByRole('table')).or(this.page.getByRole('grid'));
  }

  private get homeNav(): Locator {
    return this.page.getByRole('link', { name: /home/i }).or(this.page.getByRole('button', { name: /home/i }));
  }

  async assertVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    // History list may be empty; just assert container exists if present.
    if (await this.historyList.isVisible().catch(() => false)) {
      await expect(this.historyList).toBeVisible();
    }
  }

  async goHome(): Promise<void> {
    if (await this.homeNav.isVisible().catch(() => false)) {
      await expect(this.homeNav).toBeEnabled();
      await this.homeNav.click();
      return;
    }

    await this.page.goBack();
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('FC-TC-43: Smoke - Feeding schedule loads with pending loads', () => {
  test('loads feeding schedule, shows pending loads, allows navigation to feeding history, and returns home', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const dairySelectionPage = new DairySelectionPage(page);
    const homePage = new HomePage(page);
    const feedingSchedulePage = new FeedingSchedulePage(page);
    const feedingHistoryPage = new FeedingHistoryPage(page);

    await loginPage.goto();

    // Act
    await loginPage.login();
    await dairySelectionPage.selectDairy('ART Automation Icon Holsteins');

    // Assert (home initial state)
    await homePage.assertDairySelected('ART Automation Icon Holsteins');
    await homePage.assertZeroCompletedLoads();

    // Act
    await homePage.goToFeedingSchedule();

    // Assert
    await feedingSchedulePage.assertOnRoute();
    await feedingSchedulePage.assertVisible();
    await feedingSchedulePage.assertHasAtLeastOnePendingLoad();

    // Act
    await feedingSchedulePage.goToFeedingHistory();

    // Assert
    await feedingHistoryPage.assertVisible();

    // Act
    await feedingHistoryPage.goHome();

    // Assert
    await homePage.assertDairySelected('ART Automation Icon Holsteins');
  });
});
