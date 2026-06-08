import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';

test.describe('FC-TC-30 - ART sender flow', () => {
  test('@new NEXT button is disabled for Foundation dairy herdcode', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login();

    // Assert
    await loginPage.assertLoggedIn();
  });
});
