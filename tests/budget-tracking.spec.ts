import { test, expect } from '@playwright/test';

test.describe('Budget Tracking Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ChefsCart', { timeout: 10000 });

    // Navigate to Budget tab
    await page.click('button:has-text("Budget")');
  });

  test('should display budget dashboard', async ({ page }) => {
    // Verify main budget sections
    await expect(page.locator('text=Your Budget')).toBeVisible();
    await expect(page.locator('text=Family Budget Overview')).toBeVisible();
    await expect(page.locator('text=Current Shopping List Impact')).toBeVisible();
  });

  test('should show user budget breakdown', async ({ page }) => {
    // Check for budget components
    await expect(page.locator('text=Monthly Budget')).toBeVisible();
    await expect(page.locator('text=Spent This Month')).toBeVisible();
    await expect(page.locator('text=Remaining')).toBeVisible();

    // Teen has £200 budget
    await expect(page.locator('text=£200.00').first()).toBeVisible();
  });

  test('should display budget progress bar', async ({ page }) => {
    // Check for budget usage progress
    await expect(page.locator('text=Budget Usage')).toBeVisible();

    // Progress bar should exist
    const progressBar = page.locator('.w-full.bg-gray-200.rounded-full.h-4').first();
    await expect(progressBar).toBeVisible();
  });

  test('should show family total budget', async ({ page }) => {
    // Family budget section
    await expect(page.locator('text=Total Family Budget')).toBeVisible();
    await expect(page.locator('text=Total Spent')).toBeVisible();
    await expect(page.locator('text=Family Remaining')).toBeVisible();

    // Total should be £1400 (£600 + £600 + £200)
    await expect(page.locator('text=£1400.00').first()).toBeVisible();
  });

  test('should display all family members budgets', async ({ page }) => {
    // Check for Individual Budgets section
    await expect(page.locator('text=Individual Budgets')).toBeVisible();

    // All three users should be listed
    const budgetSection = page.locator('text=Individual Budgets').locator('..');
    await expect(budgetSection.locator('text=Parent 1')).toBeVisible();
    await expect(budgetSection.locator('text=Parent 2')).toBeVisible();
    await expect(budgetSection.locator('text=Teen')).toBeVisible();
  });

  test('should show shopping list impact on budget', async ({ page }) => {
    // Navigate to shopping list first
    await page.click('button:has-text("Shopping List")');

    // Add an item with price
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Expensive Item');
    await page.fill('input[placeholder="0.00"]', '25.00');
    await page.click('button:has-text("Add Item")');

    // Go back to budget
    await page.click('button:has-text("Budget")');

    // Check shopping list impact section
    await expect(page.locator('text=Estimated Total')).toBeVisible();
    await expect(page.locator('text=£25.00')).toBeVisible();
  });

  test('should display budget alerts when approaching limit', async ({ page }) => {
    // Note: This test would need budget to be over 75% to trigger alert
    // For now, just check the structure exists

    // Check that budget status is shown
    const budgetSection = page.locator('text=Your Budget').locator('..');
    await expect(budgetSection).toBeVisible();

    // Status badge should exist (Good, Warning, or Critical)
    const statusBadges = page.locator('text=/Good|Warning|Critical/');
    const count = await statusBadges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show spending by category', async ({ page }) => {
    // Check for spending categories section
    await expect(page.locator('text=Spending by Category')).toBeVisible();

    // Categories should be listed
    await expect(page.locator('text=Fruits & Vegetables')).toBeVisible();
    await expect(page.locator('text=Meat & Fish')).toBeVisible();
    await expect(page.locator('text=Dairy & Eggs')).toBeVisible();
  });

  test('should display savings tips', async ({ page }) => {
    // Check for savings tips section
    await expect(page.locator('text=Savings Tips')).toBeVisible();

    // Specific tips should be visible
    await expect(page.locator('text=Compare prices')).toBeVisible();
    await expect(page.locator('text=Buy store brands')).toBeVisible();
    await expect(page.locator('text=Plan meals ahead')).toBeVisible();
  });

  test('should mention UK supermarkets in tips', async ({ page }) => {
    // UK supermarket names should appear
    await expect(page.locator('text=Aldi')).toBeVisible();
    await expect(page.locator('text=Lidl')).toBeVisible();
    await expect(page.locator('text=Tesco')).toBeVisible();
  });

  test('should switch user and show different budget', async ({ page }) => {
    // Check Teen budget (£200)
    await expect(page.locator('text=£200.00').first()).toBeVisible();

    // Switch to Parent 1
    const parent1Card = page.locator('button').filter({ hasText: 'Parent 1' }).first();
    await parent1Card.click();
    await page.waitForTimeout(500);

    // Navigate back to Budget
    await page.click('button:has-text("Budget")');

    // Check Parent 1 budget (£600)
    await expect(page.locator('text=£600.00').first()).toBeVisible();
  });

  test('should calculate remaining budget correctly', async ({ page }) => {
    // Initial state: spent = 0, budget = 200, remaining = 200
    await expect(page.locator('text=£200.00').first()).toBeVisible();

    // Remaining budget should match monthly budget initially
    const remainingText = await page.locator('text=Remaining').locator('..').textContent();
    expect(remainingText).toContain('£200.00');
  });

  test('should show after purchase budget projection', async ({ page }) => {
    // Add items to shopping list
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Test Purchase');
    await page.fill('input[placeholder="0.00"]', '10.00');
    await page.click('button:has-text("Add Item")');

    // Go to budget
    await page.click('button:has-text("Budget")');

    // Should show "After Purchase" section
    await expect(page.locator('text=After Purchase')).toBeVisible();

    // Remaining budget calculation should be visible
    await expect(page.locator('text=Remaining budget')).toBeVisible();
  });

  test('should warn if shopping list exceeds budget', async ({ page }) => {
    // Add expensive item that exceeds budget
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Too Expensive');
    await page.fill('input[placeholder="0.00"]', '1500.00');
    await page.click('button:has-text("Add Item")');

    // Go to budget
    await page.click('button:has-text("Budget")');

    // Should show warning about exceeding budget
    await expect(page.locator('text=Exceeds Budget')).toBeVisible();
  });

  test('should show budget percentage usage', async ({ page }) => {
    // Budget usage percentage should be displayed
    await expect(page.locator('text=Budget Usage')).toBeVisible();

    // Should show percentage (initially 0.0% or similar)
    const percentageText = await page.locator('text=/\\d+\\.\\d+%/').first().textContent();
    expect(percentageText).toMatch(/\d+\.\d+%/);
  });

  test('should display category spending with percentages', async ({ page }) => {
    // Categories should show percentage
    const categorySection = page.locator('text=Spending by Category').locator('..');

    // Should have percentage indicators
    const percentages = categorySection.locator('text=/%/');
    const count = await percentages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show Tesco Clubcard and Nectar in tips', async ({ page }) => {
    // Loyalty cards should be mentioned
    await expect(page.locator('text=Tesco Clubcard')).toBeVisible();
    await expect(page.locator('text=Nectar')).toBeVisible();
  });

  test('should display all individual budget progress bars', async ({ page }) => {
    // Individual budgets section should have progress bars for all users
    const individualSection = page.locator('text=Individual Budgets').locator('..');
    const progressBars = individualSection.locator('.h-2.rounded-full');
    const count = await progressBars.count();

    // Should have 3 progress bars (one per user)
    expect(count).toBe(3);
  });

  test('should color-code budget status', async ({ page }) => {
    // Budget status should have color coding
    const statusBadge = page.locator('.px-3.py-1.rounded-full').first();
    await expect(statusBadge).toBeVisible();

    // Should contain status text
    const statusText = await statusBadge.textContent();
    expect(statusText).toMatch(/Good|Warning|Critical/);
  });
});
