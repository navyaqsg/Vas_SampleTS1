import { test } from '@playwright/test';

test.describe('FC-TC-29', () => {
  test('@new FC-TC-29 - placeholder', async ({ page }) => {
    await page.goto('/');
  });
});
