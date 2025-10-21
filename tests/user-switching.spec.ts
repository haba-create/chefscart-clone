import { test, expect } from '@playwright/test';

test.describe('User Switching Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ChefsCart', { timeout: 10000 });
  });

  test('should display all three family members', async ({ page }) => {
    // Check for all three users in the user switcher
    await expect(page.locator('text=Parent 1')).toBeVisible();
    await expect(page.locator('text=Parent 2')).toBeVisible();
    await expect(page.locator('text=Teen')).toBeVisible();
  });

  test('should show current user information in header', async ({ page }) => {
    // Default user is Teen
    await expect(page.locator('text=Teen')).toBeVisible();
    await expect(page.locator('text=Level 1')).toBeVisible();
  });

  test('should switch between users', async ({ page }) => {
    // Initially on Teen
    await expect(page.locator('text=Teen').first()).toBeVisible();

    // Switch to Parent 1
    const parent1Card = page.locator('button').filter({ hasText: 'Parent 1' }).first();
    await parent1Card.click();

    // Wait for switch
    await page.waitForTimeout(500);

    // Verify header shows Parent 1
    await expect(page.locator('header').locator('text=Parent 1')).toBeVisible();
  });

  test('should display different budgets for each user', async ({ page }) => {
    // Check Teen budget (£200)
    const teenBudget = page.locator('text=£200');
    await expect(teenBudget).toBeVisible();

    // Switch to Parent 1
    await page.locator('button').filter({ hasText: 'Parent 1' }).first().click();
    await page.waitForTimeout(500);

    // Check Parent 1 budget (£600)
    const parent1Budget = page.locator('text=£600');
    await expect(parent1Budget).toBeVisible();
  });

  test('should show user-specific points and levels', async ({ page }) => {
    // Teen starts at level 1 with 0 points
    await expect(page.locator('text=Level 1')).toBeVisible();
    await expect(page.locator('text=0 pts')).toBeVisible();

    // Add an item to earn points
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Test Item');
    await page.click('button:has-text("Add Item")');

    // Points should increase (5 points for adding item)
    await expect(page.locator('text=5 pts')).toBeVisible();
  });

  test('should highlight selected user', async ({ page }) => {
    // Teen should be selected by default
    const teenCard = page.locator('button').filter({ hasText: 'Teen (16)' }).first();
    await expect(teenCard).toHaveClass(/border-primary-500/);
  });

  test('should show role-specific labels', async ({ page }) => {
    // Check for role labels
    await expect(page.locator('text=Parent 1')).toBeVisible();
    await expect(page.locator('text=Parent 2')).toBeVisible();
    await expect(page.locator('text=Teen (16)')).toBeVisible();
  });

  test('should maintain user context when navigating tabs', async ({ page }) => {
    // Switch to Parent 1
    await page.locator('button').filter({ hasText: 'Parent 1' }).first().click();
    await page.waitForTimeout(500);

    // Navigate to Budget tab
    await page.click('button:has-text("Budget")');

    // Verify still Parent 1
    await expect(page.locator('header').locator('text=Parent 1')).toBeVisible();

    // Navigate to Achievements
    await page.click('button:has-text("Achievements")');

    // Verify still Parent 1
    await expect(page.locator('header').locator('text=Parent 1')).toBeVisible();
  });

  test('should show budget progress bars for all users', async ({ page }) => {
    // Verify budget bars are visible for all users
    const progressBars = page.locator('.w-full.bg-gray-200.rounded-full.h-2');
    const count = await progressBars.count();

    // Should have at least 3 progress bars (one for each user)
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should persist user selection on page reload', async ({ page }) => {
    // Switch to Parent 2
    await page.locator('button').filter({ hasText: 'Parent 2' }).first().click();
    await page.waitForTimeout(500);

    // Verify Parent 2 is selected
    await expect(page.locator('header').locator('text=Parent 2')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForSelector('text=ChefsCart');

    // Verify Parent 2 is still selected
    await expect(page.locator('header').locator('text=Parent 2')).toBeVisible();
  });

  test('should show user avatar initials', async ({ page }) => {
    // Check for user initials in avatars
    const avatars = page.locator('.w-10.h-10.bg-gradient-to-br');
    await expect(avatars.first()).toBeVisible();

    // Teen's initial should be "T"
    await expect(page.locator('text=T').first()).toBeVisible();
  });
});
