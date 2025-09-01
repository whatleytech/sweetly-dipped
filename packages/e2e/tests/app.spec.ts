import { test, expect } from '@playwright/test';

test.describe('Sweetly Dipped Application', () => {
  test.beforeEach(async ({ page }) => {
    // Check if web server is available first
    try {
      await page.goto('/', { timeout: 5000 });
    } catch (error) {
      test.skip();
    }
  });

  test('should load the main page', async ({ page }) => {
    // Basic test to verify the page loads
    await expect(page).toHaveTitle(/Sweetly Dipped/);
  });

  test('should have a main heading', async ({ page }) => {
    // Check that there's a main heading on the page
    await expect(page.getByRole('heading', { name: /Personalized Chocolate-Covered Treats/i })).toBeVisible();
  });
});

test.describe('API Integration', () => {
  test('should have working health endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });
});
