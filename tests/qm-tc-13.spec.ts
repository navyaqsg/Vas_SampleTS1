import { test, expect, type Locator, type Page } from '@playwright/test';

class LoginPage {
  constructor(private readonly page: Page) {}

  private usernameField(): Locator {
    return this.page
      .getByLabel(/user(name)?|email/i)
      .or(
        this.page.locator(
          'input[type="email"], input[name*="user" i], input[name*="email" i], input[autocomplete="username"]',
        ),
      );
  }

  private passwordField(): Locator {
    return this.page
      .getByLabel(/password/i)
      .or(this.page.locator('input[type="password"], input[name*="pass" i], input[autocomplete="current-password"]'));
  }

  private signInButton(): Locator {
    return this.page
      .getByRole('button', { name: /sign in|log in|login/i })
      .or(this.page.locator('button[type="submit"], input[type="submit"]'));
  }

  async goto(): Promise<void> {
    const baseURL = test.info().project.use.baseURL;
    if (!baseURL) throw new Error('baseURL is not configured in Playwright project config.');
    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20_000 });
    await expect(this.passwordField().first()).toBeVisible({ timeout: 20_000 });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField().first().fill(username);
    await this.passwordField().first().fill(password);
    await this.signInButton().first().click();

    await expect(this.page.locator('nav, header, main').first()).toBeVisible({ timeout: 30_000 });
    await expect(this.passwordField().first()).toBeHidden({ timeout: 30_000 });
  }
}

class AppShell {
  constructor(private readonly page: Page) {}

  private userMenuButton(): Locator {
    return this.page
      .getByRole('button', { name: /account|profile|user|menu/i })
      .or(this.page.getByRole('button', { name: /logout|log out|sign out/i }))
      .or(this.page.locator('[aria-label*="account" i], [aria-label*="profile" i], [data-testid*="user" i]'));
  }

  private logoutButton(): Locator {
    return this.page
      .getByRole('menuitem', { name: /logout|log out|sign out/i })
      .or(this.page.getByRole('button', { name: /logout|log out|sign out/i }))
      .or(this.page.locator('a:has-text("Logout"), a:has-text("Log out"), button:has-text("Logout"), button:has-text("Log out")'));
  }

  async logout(): Promise<void> {
    const menu = this.userMenuButton().first();
    if (await menu.isVisible().catch(() => false)) {
      await menu.click();
    }

    await this.logoutButton().first().click({ timeout: 20_000 });

    await expect(this.page.getByLabel(/user(name)?|email/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByLabel(/password/i).first()).toBeVisible({ timeout: 30_000 });
  }
}

class ClientSelectionPage {
  constructor(private readonly page: Page) {}

  private modalOverlay(): Locator {
    // From failure: <div class="fixed ... bg-[var(--modal-bg)]"> intercepts pointer events
    return this.page.locator('.bg-[var(--modal-bg)]');
  }

  private clientSwitcherCombobox(): Locator {
    return this.page
      .getByRole('combobox', { name: /client/i })
      .or(this.page.getByLabel(/client/i))
      .or(this.page.locator('[data-testid*="client" i] [role="combobox"], [data-testid*="client" i]'));
  }

  private clientSwitcherButton(): Locator {
    return this.page
      .getByRole('button', { name: /client/i })
      .or(this.page.locator('[data-testid*="client" i], button:has-text("Client"), button:has-text("Clients")'));
  }

  private clientListbox(): Locator {
    return this.page.locator('[role="listbox"], [role="menu"], [data-testid*="client" i]');
  }

  private async dismissBlockingModalIfPresent(): Promise<void> {
    const overlay = this.modalOverlay().first();
    if (!(await overlay.isVisible().catch(() => false))) return;

    const close = this.page
      .getByRole('button', { name: /close|dismiss|cancel|ok|got it/i })
      .or(this.page.locator('[aria-label="Close"], [data-testid*="close" i]'));

    if (await close.first().isVisible().catch(() => false)) {
      await close.first().click({ timeout: 10_000 });
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(overlay).toBeHidden({ timeout: 20_000 });
  }

  async openClientList(): Promise<void> {
    await this.dismissBlockingModalIfPresent();

    const combo = this.clientSwitcherCombobox().first();
    if (await combo.isVisible().catch(() => false)) {
      await combo.click({ timeout: 20_000, trial: true }).catch(async () => {
        await this.dismissBlockingModalIfPresent();
      });
      await combo.click({ timeout: 20_000 });
      return;
    }

    const switcher = this.clientSwitcherButton().first();
    await expect(switcher).toBeVisible({ timeout: 20_000 });
    await switcher.click({ timeout: 20_000, trial: true }).catch(async () => {
      await this.dismissBlockingModalIfPresent();
    });
    await switcher.click({ timeout: 20_000 });
  }

  async assertClientVisible(clientName: string): Promise<void> {
    await this.openClientList();

    const option = this.page
      .getByRole('option', { name: new RegExp(`^${clientName}$`, 'i') })
      .or(this.page.getByRole('menuitem', { name: new RegExp(`^${clientName}$`, 'i') }))
      .or(this.page.getByText(new RegExp(`\b${clientName}\b`, 'i')));

    await expect(option.first()).toBeVisible({ timeout: 20_000 });
    await expect(this.clientListbox().first()).toBeVisible({ timeout: 20_000 });
  }
}

function getCreds(prefix: 'TESTER' | 'LEAD' | 'ADMIN'): { username: string; password: string } {
  const username = process.env[`${prefix}_USERNAME`] ?? process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
  const password = process.env[`${prefix}_PASSWORD`] ?? process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

  if (!username || !password) {
    throw new Error(
      `Missing credentials for ${prefix}. Provide ${prefix}_USERNAME/${prefix}_PASSWORD, or TEST_USERNAME/TEST_PASSWORD, or APP_USERNAME/APP_PASSWORD.`,
    );
  }

  return { username, password };
}

test.describe('QM-TC-13: Client TEST visible for any authenticated role', { tag: '@new' }, () => {
  test('All roles can see client TEST in client selection list', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const appShell = new AppShell(page);
    const clientSelection = new ClientSelectionPage(page);

    const roles: Array<'TESTER' | 'LEAD' | 'ADMIN'> = ['TESTER', 'LEAD', 'ADMIN'];

    for (const role of roles) {
      const { username, password } = getCreds(role);

      await loginPage.goto();
      await loginPage.login(username, password);

      await clientSelection.assertClientVisible('TEST');

      if (role !== 'ADMIN') {
        await appShell.logout();
      }
    }
  });
});
