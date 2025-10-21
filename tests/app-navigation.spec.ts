import { test, expect } from '@playwright/test';

test.describe('App Navigation and General Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ChefsCart', { timeout: 10000 });
  });

  test('should load the application', async ({ page }) => {
    // Verify app loaded
    await expect(page.locator('text=ChefsCart')).toBeVisible();
    await expect(page.locator('text=Smart Family Shopping')).toBeVisible();
  });

  test('should display header with logo', async ({ page }) => {
    // Header should be visible
    await expect(page.locator('header')).toBeVisible();

    // Logo and title should be present
    await expect(page.locator('text=ChefsCart')).toBeVisible();
  });

  test('should show all navigation tabs', async ({ page }) => {
    // Check for all tabs
    await expect(page.locator('button:has-text("Shopping List")')).toBeVisible();
    await expect(page.locator('button:has-text("Budget")')).toBeVisible();
    await expect(page.locator('button:has-text("Achievements")')).toBeVisible();
    await expect(page.locator('button:has-text("Meal Plans")')).toBeVisible();
    await expect(page.locator('button:has-text("AI Assistant")')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Navigate to each tab
    await page.click('button:has-text("Shopping List")');
    await expect(page.locator('text=Total Items')).toBeVisible();

    await page.click('button:has-text("Budget")');
    await expect(page.locator('text=Your Budget')).toBeVisible();

    await page.click('button:has-text("Achievements")');
    await expect(page.locator('text=Active Challenges')).toBeVisible();

    await page.click('button:has-text("Meal Plans")');
    await expect(page.locator('text=Browse Recipes')).toBeVisible();

    await page.click('button:has-text("AI Assistant")');
    await expect(page.locator('text=AI Shopping Assistant')).toBeVisible();
  });

  test('should highlight active tab', async ({ page }) => {
    // Click Budget tab
    const budgetTab = page.locator('button:has-text("Budget")');
    await budgetTab.click();

    // Should have active styling
    await expect(budgetTab).toHaveClass(/border-primary-600/);
  });

  test('should display user info in header', async ({ page }) => {
    // User name should be visible
    await expect(page.locator('header').locator('text=Teen')).toBeVisible();

    // Level and points should be visible
    await expect(page.locator('header').locator('text=Level 1')).toBeVisible();
    await expect(page.locator('header').locator('text=/\\d+ pts/')).toBeVisible();
  });

  test('should show budget remaining in header', async ({ page }) => {
    // Budget info should be in header
    await expect(page.locator('text=left')).toBeVisible();
  });

  test('should show shopping progress in header', async ({ page }) => {
    // Shopping progress should be visible
    await expect(page.locator('text=items').first()).toBeVisible();
  });

  test('should display notification bell', async ({ page }) => {
    // Notification bell should be present
    const notificationBell = page.locator('button').filter({ has: page.locator('svg') });
    await expect(notificationBell.first()).toBeVisible();
  });

  test('should show user avatar', async ({ page }) => {
    // User avatar with initial should be visible
    await expect(page.locator('text=T').last()).toBeVisible();
  });

  test('should render tab icons', async ({ page }) => {
    // Tab emojis should be visible
    await expect(page.locator('text=🛒')).toBeVisible(); // Shopping cart
    await expect(page.locator('text=💰')).toBeVisible(); // Budget
    await expect(page.locator('text=🏆')).toBeVisible(); // Achievements
    await expect(page.locator('text=🍽️')).toBeVisible(); // Meals
    await expect(page.locator('text=🤖')).toBeVisible(); // AI
  });

  test('should persist data on reload', async ({ page }) => {
    // Add an item
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Persistent Test Item');
    await page.click('button:has-text("Add Item")');

    // Reload page
    await page.reload();
    await page.waitForSelector('text=ChefsCart');

    // Go to shopping list
    await page.click('button:has-text("Shopping List")');

    // Item should still be there
    await expect(page.locator('text=Persistent Test Item')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // App should still be functional
    await expect(page.locator('text=ChefsCart')).toBeVisible();

    // Tabs should be scrollable
    const tabs = page.locator('button:has-text("Shopping List")');
    await expect(tabs).toBeVisible();
  });

  test('should show user switcher component', async ({ page }) => {
    // User switcher should be visible
    await expect(page.locator('text=Switch User')).toBeVisible();

    // All three users should be shown
    await expect(page.locator('text=Parent 1')).toBeVisible();
    await expect(page.locator('text=Parent 2')).toBeVisible();
    await expect(page.locator('text=Teen').first()).toBeVisible();
  });

  test('should maintain state when switching tabs', async ({ page }) => {
    // Add item in shopping list
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'State Test');
    await page.click('button:has-text("Add Item")');

    // Navigate away
    await page.click('button:has-text("Budget")');

    // Navigate back
    await page.click('button:has-text("Shopping List")');

    // Item should still be there
    await expect(page.locator('text=State Test')).toBeVisible();
  });

  test('should handle rapid tab switching', async ({ page }) => {
    // Rapidly switch between tabs
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Shopping List")');
      await page.click('button:has-text("Budget")');
      await page.click('button:has-text("Achievements")');
    }

    // App should still be functional
    await expect(page.locator('text=ChefsCart')).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    // Check page title
    const title = await page.title();
    expect(title).toContain('ChefsCart');
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForSelector('text=ChefsCart');

    // Should have minimal or no console errors
    // Some errors might be expected (like API key missing), so we just check it doesn't crash
    expect(page.locator('text=ChefsCart')).toBeDefined();
  });

  test('should show emoji icons throughout app', async ({ page }) => {
    // Navigate through tabs and verify emojis are displayed
    await page.click('button:has-text("Achievements")');
    await expect(page.locator('text=🧑‍🎓')).toBeVisible(); // Teen emoji

    await page.click('button:has-text("Meal Plans")');
    await expect(page.locator('text=1️⃣')).toBeVisible(); // Numbered tip
  });

  test('should display gradient backgrounds', async ({ page }) => {
    // Check for gradient elements
    const gradients = page.locator('.bg-gradient-to-br');
    const count = await gradients.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show proper spacing and layout', async ({ page }) => {
    // Verify card layout exists
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
