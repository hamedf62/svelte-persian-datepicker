import { test, expect } from '@playwright/test';

test.describe('DatePicker', () => {
	test.beforeEach(async ({ page }) => {
		page.on('console', (msg) => console.log(`BROWSER CONSOLE: ${msg.text()}`));
		page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`));
		await page.goto('/');
		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');
	});

	test('should render the datepicker input', async ({ page }) => {
		const input = page.locator('input.pdp-input').first();
		await expect(input).toBeVisible();
	});

	test('should open the datepicker on click', async ({ page }) => {
		const input = page.locator('input.pdp-input').first();
		await input.click();

		// Wait for the picker to appear
		const picker = page.locator('.pdp-picker');
		await expect(picker).toBeVisible({ timeout: 5000 });
	});

	test('should select a date', async ({ page }) => {
		const input = page.locator('input.pdp-input').first();
		await input.click();

		// Wait for the picker to appear
		const picker = page.locator('.pdp-picker');
		await expect(picker).toBeVisible({ timeout: 5000 });

		// Click on a day (e.g., the 15th)
		const day15 = page
			.locator('.pdp-day:not(.not-current):not(.disabled)')
			.filter({ hasText: '15' })
			.first();
		await day15.click();

		// If auto_submit is true, it should close and update the input
		await expect(picker).not.toBeVisible();
		const value = await input.inputValue();
		expect(value).not.toBe('');
	});
});
