import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email *' });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password *' });
  }

  private get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login/');
  }

  async loginWithEnv(): Promise<void> {
    const username: string | undefined = process.env.TEST_USERNAME ?? process.env.APP_USERNAME;
    const password: string | undefined = process.env.TEST_PASSWORD ?? process.env.APP_PASSWORD;

    if (!username || !password) {
      throw new Error('Missing credentials. Set TEST_USERNAME/TEST_PASSWORD (or APP_USERNAME/APP_PASSWORD).');
    }

    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(username);
    await this.passwordInput.fill(password);

    await expect(this.signInButton).toBeVisible();
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL('/login');
    await expect(this.signInButton).toHaveCount(0);
  }
}
