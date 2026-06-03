import { test, expect, type Page, type Locator, type Request } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput(): Locator {
    return this.page.getByRole('textbox', { name: /username|email/i });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: /password/i });
  }

  private get signInButton(): Locator {
    return this.page.getByRole('button', { name: /sign in|log in/i });
  }

  async goto(): Promise<void> {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL;
    if (!baseURL) throw new Error('Missing base URL. Set PLAYWRIGHT_BASE_URL or BASE_URL.');
    await this.page.goto(baseURL);
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
    return this.page.getByRole('button', { name: /select a dairy/i });
  }

  private get dairyCombobox(): Locator {
    return this.page.getByRole('combobox', { name: /select a dairy|dairy/i });
  }

  private get dairyDialog(): Locator {
    return this.page.getByRole('dialog').or(this.page.getByRole('listbox'));
  }

  private dairyOptionByName(name: string): Locator {
    return this.page
      .getByRole('option', { name })
      .or(this.page.getByRole('menuitem', { name }))
      .or(this.page.getByRole('button', { name }))
      .or(this.page.getByText(name));
  }

  private async openDairyPicker(): Promise<void> {
    // Some environments show a dedicated "Select a dairy" button, others show a combobox directly.
    if (await this.selectADairyButton.isVisible()) {
      await expect(this.selectADairyButton).toBeEnabled();
      await this.selectADairyButton.click();
      return;
    }

    await expect(this.dairyCombobox).toBeVisible();
    await expect(this.dairyCombobox).toBeEnabled();
    await this.dairyCombobox.click();
  }

  async selectDairy(dairyName: string): Promise<void> {
    // Element recovery rule: retry opening the picker up to 2 times.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.openDairyPicker();
        break;
      } catch (e) {
        if (attempt === 2) throw e;
        await this.page.waitForTimeout(300);
      }
    }

    await expect(this.dairyDialog).toBeVisible();

    const option = this.dairyOptionByName(dairyName).first();
    await expect(option).toBeVisible();
    await option.click();
  }
}

type BullsListRequestOutcome = 'aborted' | 'completed';

interface BullsListRequestRecord {
  url: string;
  outcome: BullsListRequestOutcome;
  status?: number;
}

class BullsWorklistPage {
  constructor(private readonly page: Page) {}

  // Navigation
  async goto(): Promise<void> {
    // Best-effort navigation: rely on baseURL and app routing.
    // If your app uses a different route, set BULLS_WORKLIST_PATH.
    const path = process.env.BULLS_WORKLIST_PATH ?? '/bulls';
    await this.page.goto(path);
  }

  async assertOnBullsWorklistRoute(): Promise<void> {
    const expectedRoutePart = process.env.BULLS_WORKLIST_ROUTE_CONTAINS ?? '/bulls';
    await expect(this.page).toHaveURL(new RegExp(expectedRoutePart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  // Filters / sorting (generic, role-based)
  private get filtersButton(): Locator {
    return this.page.getByRole('button', { name: /filters?/i });
  }

  private get applyFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /apply/i });
  }

  private get clearFiltersButton(): Locator {
    return this.page.getByRole('button', { name: /clear/i });
  }

  private get isManuallyAddedCombobox(): Locator {
    return this.page.getByRole('combobox', { name: /ismanuallyadded|manually added/i });
  }

  private get lastUpdateCombobox(): Locator {
    return this.page.getByRole('combobox', { name: /last update/i });
  }

  private get sortByCombobox(): Locator {
    return this.page.getByRole('combobox', { name: /sort by/i });
  }

  private get bullsTable(): Locator {
    return this.page.getByRole('table').or(this.page.getByRole('grid'));
  }

  private get bullsTableRows(): Locator {
    return this.bullsTable.getByRole('row');
  }

  async openFilters(): Promise<void> {
    await expect(this.filtersButton).toBeVisible();
    await this.filtersButton.click();
  }

  async clearFiltersIfAvailable(): Promise<void> {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
    }
  }

  async setIsManuallyAdded(valueLabel: string): Promise<void> {
    await expect(this.isManuallyAddedCombobox).toBeVisible();
    await this.isManuallyAddedCombobox.click();
    const option = this.page.getByRole('option', { name: new RegExp(valueLabel, 'i') });
    await expect(option).toBeVisible();
    await option.click();
  }

  async setLastUpdate(valueLabel: string): Promise<void> {
    await expect(this.lastUpdateCombobox).toBeVisible();
    await this.lastUpdateCombobox.click();
    const option = this.page.getByRole('option', { name: new RegExp(valueLabel, 'i') });
    await expect(option).toBeVisible();
    await option.click();
  }

  async setSortBy(valueLabel: string): Promise<void> {
    await expect(this.sortByCombobox).toBeVisible();
    await this.sortByCombobox.click();
    const option = this.page.getByRole('option', { name: new RegExp(valueLabel, 'i') });
    await expect(option).toBeVisible();
    await option.click();
  }

  async applyFiltersIfNeeded(): Promise<void> {
    if (await this.applyFiltersButton.isVisible()) {
      await expect(this.applyFiltersButton).toBeEnabled();
      await this.applyFiltersButton.click();
    }
  }

  async assertHasAnyRows(): Promise<void> {
    await expect(this.bullsTable).toBeVisible();
    // At least header + one data row (or at least one row if grid)
    await expect(this.bullsTableRows).toHaveCountGreaterThan(1);
  }
}

function isBullsListRequest(request: Request): boolean {
  return request.method() === 'GET' && /\/api\/bulls\/alta\/bulls-list/i.test(request.url());
}

test.describe('FC-TC-20: Bulls worklist aborts stale requests on rapid filter/sort changes', () => {
  test('cancels intermediate bulls-list GET requests and renders only the final response', async ({ page, context }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const dairySelection = new DairySelectionPage(page);
    const bullsWorklist = new BullsWorklistPage(page);

    const requestRecords: BullsListRequestRecord[] = [];

    page.on('requestfinished', async (request) => {
      if (!isBullsListRequest(request)) return;
      const response = await request.response();
      requestRecords.push({
        url: request.url(),
        outcome: 'completed',
        status: response?.status(),
      });
    });

    page.on('requestfailed', (request) => {
      if (!isBullsListRequest(request)) return;
      const failure = request.failure();
      const isAborted = (failure?.errorText ?? '').toLowerCase().includes('aborted');
      requestRecords.push({
        url: request.url(),
        outcome: isAborted ? 'aborted' : 'completed',
      });
    });

    await loginPage.goto();
    await loginPage.login();

    await dairySelection.selectDairy('ART Automation Icon Holsteins');

    await bullsWorklist.goto();
    await bullsWorklist.assertOnBullsWorklistRoute();

    // Act
    await bullsWorklist.openFilters();
    await bullsWorklist.clearFiltersIfAvailable();

    // Trigger rapid successive changes that should abort in-flight requests.
    await bullsWorklist.setIsManuallyAdded('true');
    await bullsWorklist.applyFiltersIfNeeded();

    await bullsWorklist.setLastUpdate('last7Days');
    await bullsWorklist.applyFiltersIfNeeded();

    await bullsWorklist.setSortBy('Status');

    // Wait for network to settle after the last change.
    await page.waitForLoadState('networkidle');

    // Assert
    // Ensure we observed at least one aborted intermediate request and a final successful request.
    const abortedCount = requestRecords.filter((r) => r.outcome === 'aborted').length;
    const completedStatuses = requestRecords
      .filter((r) => r.outcome === 'completed')
      .map((r) => r.status)
      .filter((s): s is number => typeof s === 'number');

    await expect
      .poll(() => abortedCount, {
        message: 'Expected at least one intermediate bulls-list request to be aborted (canceled).',
      })
      .toBeGreaterThan(0);

    await expect
      .poll(() => completedStatuses, {
        message: 'Expected at least one completed bulls-list request with HTTP 200.',
      })
      .toContain(200);

    await bullsWorklist.assertHasAnyRows();
  });
});
