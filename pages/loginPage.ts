import { expect, type Locator, type Page } from '@playwright/test';
import type { Credentials } from '../types/auth.types';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get usernameTextbox(): Locator {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  private get passwordTextbox(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  private get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login({ username, password }: Credentials): Promise<void> {
    await expect(this.usernameTextbox).toBeVisible();
    await this.usernameTextbox.fill(username);

    await expect(this.passwordTextbox).toBeVisible();
    await this.passwordTextbox.fill(password);

    await expect(this.signInButton).toBeVisible();
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  async assertSignedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL('https://example.com/');
    await expect(this.signInButton).toHaveCount(0);
  }
}
