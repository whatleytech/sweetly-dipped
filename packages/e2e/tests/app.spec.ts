import { test, expect } from '@playwright/test';

test.describe("Sweetly Dipped Application", () => {
  test.beforeEach(async ({ page }) => {
    // Check if web server is available first
    try {
      await page.goto("/", { timeout: 5000 });
    } catch (error) {
      test.skip();
    }
  });

  test("should fill out the form and submit", async ({ page }) => {
    // Helper function to fill a field and wait for button to be enabled before continuing
    const fillAndContinue = async (selector: string, value: string) => {
      await page.locator(selector).fill(value);
      await expect(page.locator("#primary-form-button")).toBeEnabled({
        timeout: 5000,
      });
      await page.locator("#primary-form-button").click();
      await page.waitForTimeout(250); // Allow time for re-rendering after navigation
    };

    // Helper function to fill a field without clicking (for multi-field steps)
    const fill = async (selector: string, value: string) => {
      await page.locator(selector).fill(value);
    };

    // Helper function to click and continue (for radio buttons, checkboxes, etc.)
    const clickAndContinue = async (selector: string) => {
      await page.locator(selector).click();
      await expect(page.locator("#primary-form-button")).toBeEnabled({
        timeout: 5000,
      });
      await page.locator("#primary-form-button").click();
      await page.waitForTimeout(250); // Allow time for re-rendering after navigation
    };

    // Helper function to click the continue button after filling multiple fields
    const clickContinue = async () => {
      await expect(page.locator("#primary-form-button")).toBeEnabled({
        timeout: 5000,
      });
      await page.locator("#primary-form-button").click();
      await page.waitForTimeout(250); // Allow time for re-rendering after navigation
    };

    // Homepage
    await expect(page).toHaveTitle(/Sweetly Dipped/);
    await page.getByRole("link", { name: "Design Your Package" }).click();

    // Design Package Page - Lead Questions
    await fill("#first-name", "John");
    await fill("#last-name", "Doe");
    await fill("#email", "john.doe@example.com");
    await fill("#phone", "1234567890");
    await clickContinue();

    // Communication Preference
    await clickAndContinue("#email");

    // Package Selection
    await clickAndContinue("#medium");

    // Color Scheme
    await fillAndContinue("#color-scheme", "Pink and Gold");

    // Event Details
    await fill("#event-type", "Birthday");
    await fill("#theme", "Princess");
    await clickContinue();

    // Additional Designs
    await fillAndContinue("#additional-designs", "Add some sparkles");

    // Pickup Details
    await fill("#pickup-date", "2030-06-03");
    await clickAndContinue("#\\38 -00-am");

    // Confirmation Page
    await page.locator("#referral-source").selectOption("Tiktok");
    await page.locator("#terms-accepted").click();
    await expect(page.locator("#submit-order")).toBeEnabled();
    await page.locator("#submit-order").click();

    // Thank You Page
    await expect(page).toHaveURL("/thank-you");
    await expect(page.getByText("Thank you for your order!")).toBeVisible();
  });
});
