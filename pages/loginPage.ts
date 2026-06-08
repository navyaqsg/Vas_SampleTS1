import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get usernameInput(): Locator {
    return this.page.getByPlaceholder('Username');
  }

  private get passwordInput(): Locator {
    return this.page.getByPlaceholder('Password');
  }

  private get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(
    username: string = process.env.TEST_USERNAME ?? 'Admin',
    password: string = process.env.TEST_PASSWORD ?? 'admin123',
  ): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await expect(this.loginButton).toHaveCount(0);
  }
}
