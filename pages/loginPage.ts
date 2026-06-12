import { expect, type Locator, type Page } from "@playwright/test";
import type { LoginCredentials } from "../types/auth.types";

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get emailInput(): Locator {
    return this.page.getByRole("textbox", { name: "Email *" });
  }

  private get passwordInput(): Locator {
    return this.page.getByRole("textbox", { name: "Password *" });
  }

  private get signInButton(): Locator {
    return this.page.getByRole("button", { name: "Sign in" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/login?redirect=%2F");
  }

  async login({ username, password }: LoginCredentials): Promise<void> {
    await this.emailInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async assertLoggedIn(): Promise<void> {
    await expect(this.page).not.toHaveURL("/login?redirect=%2F");
    await expect(this.signInButton).toHaveCount(0);
  }
}
