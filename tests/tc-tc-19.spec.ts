import { test, expect, type Locator, type Page } from '@playwright/test';

class OrangeHRMLoginPage {
  constructor(private readonly page: Page) {}

  private usernameField(): Locator {
    return this.page
      .getByLabel(/username/i)
      .or(this.page.getByRole('textbox', { name: /username/i }))
      .or(this.page.locator('input[name="username"], input[placeholder*="username" i]'));
  }

  private passwordField(): Locator {
    return this.page
      .getByLabel(/password/i)
      .or(this.page.locator('input[name="password"], input[type="password"], input[autocomplete="current-password"]'));
  }

  async goto(): Promise<void> {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20_000 });
    await expect(this.passwordField().first()).toBeVisible({ timeout: 20_000 });
  }

  async focusPassword(): Promise<void> {
    await this.passwordField().first().focus();
    await expect(this.passwordField().first()).toBeFocused();
  }

  async typePassword(value: string): Promise<void> {
    const field = this.passwordField().first();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  async assertPasswordIsMasked(): Promise<void> {
    const field = this.passwordField().first();
    await expect(field).toHaveAttribute('type', 'password');

    // Ensure the browser is not rendering the value as plain text in the UI.
    const computed = await field.evaluate((el) => {
      const input = el as HTMLInputElement;
      const style = window.getComputedStyle(input);
      return {
        type: input.type,
        webkitTextSecurity: style.getPropertyValue('-webkit-text-security'),
        textSecurity: (style as unknown as { textSecurity?: string }).textSecurity ?? '',
      };
    });

    expect(computed.type).toBe('password');
    // Some browsers may not expose these properties; if they do, they should not be 'none'.
    if (computed.webkitTextSecurity) expect(computed.webkitTextSecurity).not.toBe('none');
    if (computed.textSecurity) expect(computed.textSecurity).not.toBe('none');
  }

  async clearPassword(): Promise<void> {
    const field = this.passwordField().first();
    await field.fill('');
    await expect(field).toHaveValue('');
  }
}

test.describe('TC-TC-19 Verify password masking on the login page', { tag: '@smoke' }, () => {
  test('Password characters are masked while typing', async ({ page }) => {
    // Arrange
    const login = new OrangeHRMLoginPage(page);

    // Act
    await login.goto();
    await login.focusPassword();
    await login.typePassword('TestPwd123');

    // Assert
    await login.assertPasswordIsMasked();

    // Cleanup
    await login.clearPassword();
  });
});
