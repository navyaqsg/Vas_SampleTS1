import { test, expect, type Locator, type Page } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  async loginIfPresent(): Promise<void> {
    const username = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    const usernameInput = this.page
      .getByLabel(/username|email/i)
      .or(this.page.getByPlaceholder(/username|email/i));
    const passwordInput = this.page
      .getByLabel(/password/i)
      .or(this.page.getByPlaceholder(/password/i));
    const signInButton = this.page.getByRole('button', { name: /sign in|log in|login/i });

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

class AppNav {
  constructor(private readonly page: Page) {}

  async openEquipmentSettings(): Promise<void> {
    // Navigate: FeedComp > Settings > Equipment
    const feedCompNav = this.page
      .getByRole('link', { name: /feedcomp/i })
      .or(this.page.getByRole('button', { name: /feedcomp/i }))
      .or(this.page.getByText(/feedcomp/i));

    if (await feedCompNav.first().isVisible().catch(() => false)) {
      await feedCompNav.first().click();
    }

    const settingsNav = this.page
      .getByRole('link', { name: /settings/i })
      .or(this.page.getByRole('button', { name: /settings/i }))
      .or(this.page.getByLabel(/settings/i))
      .or(this.page.getByText(/settings/i));

    const hamburger = this.page
      .getByRole('button', { name: /menu|navigation|open menu|hamburger/i })
      .or(this.page.getByLabel(/menu|navigation/i))
      .or(this.page.getByRole('button', { name: /☰/ }));

    // Some layouts hide left nav behind a hamburger; open it if Settings isn't visible.
    if (!(await settingsNav.first().isVisible().catch(() => false))) {
      if (await hamburger.first().isVisible().catch(() => false)) {
        await hamburger.first().click();
      }
    }

    // If Settings is still not present, fall back to direct navigation.
    if (!(await settingsNav.first().isVisible().catch(() => false))) {
      await this.page.goto(/\/$/.test(this.page.url()) ? `${this.page.url()}settings/equipment` : `${this.page.url()}/settings/equipment`, {
        waitUntil: 'domcontentloaded',
      });
      return;
    }

    await settingsNav.first().click();

    const equipmentNav = this.page
      .getByRole('link', { name: /equipment/i })
      .or(this.page.getByRole('button', { name: /equipment/i }))
      .or(this.page.getByLabel(/equipment/i))
      .or(this.page.getByText(/^equipment$/i));

    if (!(await equipmentNav.first().isVisible().catch(() => false))) {
      await this.page.goto(/\/$/.test(this.page.url()) ? `${this.page.url()}settings/equipment` : `${this.page.url()}/settings/equipment`, {
        waitUntil: 'domcontentloaded',
      });
      return;
    }

    await equipmentNav.first().click();
  }
}

class EquipmentSettingsPage {
  constructor(private readonly page: Page) {}

  readonly heading = this.page.getByRole('heading', { name: /equipment/i }).or(this.page.getByText(/^equipment$/i));

  equipmentRowByName(name: string): Locator {
    // Prefer semantic row; fallback to clickable text.
    return this.page
      .getByRole('row', { name: new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i') })
      .or(this.page.getByRole('row').filter({ hasText: new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i') }))
      .or(this.page.getByText(new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i')));
  }

  async expectListVisible(): Promise<void> {
    await expect(this.heading.first()).toBeVisible({ timeout: 30000 });
    // Table/grid/list presence
    const tableOrGrid = this.page.locator('table, [role="table"], [role="grid"], [data-testid*="equipment" i]');
    await expect(tableOrGrid.first()).toBeVisible({ timeout: 30000 });
  }

  async openEquipment(name: string): Promise<void> {
    const row = this.equipmentRowByName(name).first();
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.click();
  }

  async expectEquipmentNotVisibleInActiveList(name: string): Promise<void> {
    // If there is a Show Inactive toggle, ensure it's off.
    const showInactive = this.page
      .getByRole('checkbox', { name: /show inactive/i })
      .or(this.page.getByRole('switch', { name: /show inactive/i }))
      .or(this.page.getByLabel(/show inactive/i));

    if (await showInactive.first().isVisible().catch(() => false)) {
      const role = await showInactive.first().getAttribute('role');
      if (role === 'checkbox') {
        if (await showInactive.first().isChecked().catch(() => false)) await showInactive.first().uncheck();
      } else {
        const checked = await showInactive.first().getAttribute('aria-checked');
        if (checked === 'true') await showInactive.first().click();
      }
    }

    await expect(this.equipmentRowByName(name).first()).toBeHidden({ timeout: 30000 });
  }
}

class EquipmentEditPanel {
  constructor(private readonly page: Page) {}

  private panel(): Locator {
    return this.page
      .getByRole('dialog')
      .or(this.page.locator('[role="complementary"], [data-testid*="drawer" i], [data-testid*="slideover" i]'));
  }

  async expectOpenFor(name: string): Promise<void> {
    const panel = this.panel().first();
    await expect(panel).toBeVisible({ timeout: 30000 });
    await expect(panel.getByText(new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i')).first()).toBeVisible({ timeout: 30000 });
  }

  private activeToggle(): Locator {
    return this.page
      .getByRole('switch', { name: /active|inactive|status/i })
      .or(this.page.getByRole('checkbox', { name: /active|inactive/i }))
      .or(this.page.getByLabel(/active|inactive|status/i));
  }

  private deactivateButton(): Locator {
    return this.page.getByRole('button', { name: /deactivate|set inactive|inactivate/i });
  }

  private saveButton(): Locator {
    return this.page.getByRole('button', { name: /save|confirm|update|apply/i });
  }

  async deactivate(): Promise<void> {
    const toggle = this.activeToggle().first();
    const deactivateBtn = this.deactivateButton().first();

    if (await deactivateBtn.isVisible().catch(() => false)) {
      await deactivateBtn.click();
      return;
    }

    await expect(toggle).toBeVisible({ timeout: 30000 });

    const role = await toggle.getAttribute('role');
    if (role === 'checkbox') {
      if (await toggle.isChecked().catch(() => false)) {
        await toggle.uncheck();
      } else {
        // already inactive
      }
      return;
    }

    const checked = await toggle.getAttribute('aria-checked');
    if (checked === 'true') {
      await toggle.click();
    }
  }

  async save(): Promise<void> {
    const save = this.saveButton().first();
    await expect(save).toBeVisible({ timeout: 30000 });
    await save.click();
  }

  async expectSuccessToast(): Promise<void> {
    const toast = this.page
      .getByRole('alert')
      .or(this.page.locator('[role="status"]'))
      .or(this.page.getByText(/success|updated|saved|deactivated|inactive/i));

    await expect(toast.first()).toBeVisible({ timeout: 30000 });
  }

  async close(): Promise<void> {
    const panel = this.panel().first();

    const closeButton = panel
      .getByRole('button', { name: /close|cancel|x/i })
      .or(panel.getByLabel(/close/i));

    if (await closeButton.first().isVisible().catch(() => false)) {
      await closeButton.first().click();
      await expect(panel).toBeHidden({ timeout: 30000 });
      return;
    }

    await this.page.keyboard.press('Escape');
    await expect(panel).toBeHidden({ timeout: 30000 });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

test.describe('WC-TC-3: Deactivate active equipment from Equipment Settings', () => {
  test('deactivates an active equipment and removes it from active list', async ({ page }) => {
    // Arrange
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL;
    if (!baseURL) throw new Error('Missing base URL. Set PLAYWRIGHT_BASE_URL or BASE_URL.');

    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    const login = new LoginPage(page);
    const nav = new AppNav(page);
    const equipment = new EquipmentSettingsPage(page);
    const panel = new EquipmentEditPanel(page);

    const equipmentName = process.env.TEST_EQUIPMENT_NAME ?? 'Eq1';

    // Act
    await login.loginIfPresent();
    await nav.openEquipmentSettings();

    await equipment.expectListVisible();
    await equipment.openEquipment(equipmentName);

    await panel.expectOpenFor(equipmentName);
    await panel.deactivate();
    await panel.save();

    // Assert
    await panel.expectSuccessToast();
    await panel.close();
    await equipment.expectEquipmentNotVisibleInActiveList(equipmentName);
  });
});
