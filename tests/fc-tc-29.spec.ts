import { test } from '@playwright/test';

test.describe('FC-TC-29 - ART sender flow', () => {
  test('@new test2 Foundation dairy herdcode shows warning and disables NEXT', async ({ page }) => {
    await page.goto('/dairy/34858');
  });
});
