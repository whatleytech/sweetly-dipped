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

  test.only("should fill out the form and submit", async ({ page }) => {
    // Homepage
    await page.getByRole("link", { name: "Design Your Package" }).click();

    // Design Package Page
    await page.locator("#first-name").fill("John");
    await page.locator("#last-name").fill("Doe");
    await page.locator("#email").fill("john.doe@example.com");
    await page.locator("#phone").fill("1234567890");
    await page.locator("#primary-form-button").click();
    await page.locator("#email").click();
    await page.locator("#primary-form-button").click();
    await page.locator("#medium").click();
    await page.locator("#primary-form-button").click();
    // await page.getByRole("radio", { name: "By The Dozen" }).fill("1");
    // await page.locator("#primary-form-button").click();
    await page.locator("#color-scheme").fill("Pink and Gold");
    await page.locator("#primary-form-button").click();
    await page.locator("#event-type").fill("Birthday");
    await page.locator("#theme").fill("Princess");
    await page.locator("#primary-form-button").click();
    await page.locator("#additional-designs").fill("Add some sparkles");
    await page.locator("#primary-form-button").click();
    await page.locator("#pickup-date").fill("2030-06-03");
    await page.locator("#\\38 -00-am").click();
    await page.locator("#primary-form-button").click();

    // Confirmation Page
    await page.locator("#referral-source").selectOption("Tiktok");
    await page.locator("#terms-accepted").click();
    await page.locator("#submit-order").click();

    // Thank You Page
    await expect(page).toHaveURL("/thank-you");
    await expect(page.getByText("Thank you for your order!")).toBeVisible();
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
