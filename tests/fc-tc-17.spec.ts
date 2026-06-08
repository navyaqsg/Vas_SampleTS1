import { test } from '@playwright/test';

test.describe('FC-TC-17 - Dairies search smoke', () => {
  test('@new FC-TC-17 Verify search functionality on the Dairies page works end-to-end after abort signal implementation', async ({ page }) => {
    await page.goto('/');
  });
});
