import { test, expect, type Locator, type Page } from '@playwright/test';

class LoginPage {
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
    // Reuse the same login URL used across existing tests in this repo.
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.usernameField().first()).toBeVisible({ timeout: 20_000 });
    await expect(this.passwordField().first()).toBeVisible({ timeout: 20_000 });
  }

  async assertPasswordFieldTypeIsPassword(): Promise<void> {
    await expect(this.passwordField().first()).toHaveAttribute('type', 'password');
  }

  async fillPassword(value: string): Promise<void> {
    const field = this.passwordField().first();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  async assertPasswordInputIsMasked(): Promise<void> {
    const field = this.passwordField().first();

    // Primary, deterministic check: input type=password.
    await expect(field).toHaveAttribute('type', 'password');

    // Secondary check: if the browser exposes text-security properties, they should not be 'none'.
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
    if (computed.webkitTextSecurity) expect(computed.webkitTextSecurity).not.toBe('none');
    if (computed.textSecurity) expect(computed.textSecurity).not.toBe('none');
  }
}

test.describe('TC-TC-27 Password masking is enforced for the login field', () => {
  test('Password input is masked; password characters are not displayed in plaintext', async ({ page }) => {
    // Arrange
    const login = new LoginPage(page);

    // Act
    await login.goto();

    // Assert (type attribute)
    await login.assertPasswordFieldTypeIsPassword();

    // Act (enter password)
    const password = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;
    if (!password) throw new Error('Missing password. Set TEST_PASSWORD (or APP_PASSWORD).');
    await login.fillPassword(password);

    // Assert (masked during input)
    await login.assertPasswordInputIsMasked();
  });
});
