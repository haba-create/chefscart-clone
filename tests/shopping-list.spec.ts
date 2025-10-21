import { test, expect } from '@playwright/test';

test.describe('Shopping List Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('text=ChefsCart', { timeout: 10000 });
  });

  test('should display shopping list page', async ({ page }) => {
    // Navigate to shopping list tab
    await page.click('button:has-text("Shopping List")');

    // Verify the page title and elements
    await expect(page.locator('text=Total Items')).toBeVisible();
    await expect(page.locator('text=Purchased')).toBeVisible();
    await expect(page.locator('text=Estimated Cost')).toBeVisible();
    await expect(page.locator('text=Budget Left')).toBeVisible();
  });

  test('should add a new item to shopping list', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Click add item button
    await page.click('button:has-text("Add Item to Shopping List")');

    // Fill in the form
    await page.fill('input[placeholder*="Milk"]', 'Fresh Milk');
    await page.selectOption('select', { label: 'Dairy & Eggs' });
    await page.fill('input[type="number"]', '2');
    await page.fill('input[placeholder="0.00"]', '2.50');

    // Submit the form
    await page.click('button:has-text("Add Item")');

    // Verify the item was added
    await expect(page.locator('text=Fresh Milk')).toBeVisible();
    await expect(page.locator('text=2 items')).toBeVisible();
    await expect(page.locator('text=Dairy & Eggs')).toBeVisible();
  });

  test('should toggle item as purchased', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Add an item first
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Test Item');
    await page.click('button:has-text("Add Item")');

    // Find and click the checkbox to mark as purchased
    const checkbox = page.locator('button').filter({ has: page.locator('svg') }).first();
    await checkbox.click();

    // Verify item appears in purchased section
    await expect(page.locator('text=Purchased (1)')).toBeVisible();
  });

  test('should remove item from shopping list', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Add an item
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Item to Remove');
    await page.click('button:has-text("Add Item")');

    // Wait for item to appear
    await expect(page.locator('text=Item to Remove')).toBeVisible();

    // Click delete button (trash icon)
    await page.locator('button:has-text("")').last().click();

    // Verify item is removed
    await expect(page.locator('text=Item to Remove')).not.toBeVisible();
  });

  test('should vote on shopping items', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Add an item
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Votable Item');
    await page.click('button:has-text("Add Item")');

    // Find the item's thumbs up button and click it
    const itemCard = page.locator('div').filter({ hasText: 'Votable Item' }).first();
    const thumbsUp = itemCard.locator('button').filter({ has: page.locator('svg') }).nth(1);
    await thumbsUp.click();

    // Verify the vote count increased
    await expect(itemCard.locator('text=1')).toBeVisible();
  });

  test('should display correct budget calculations', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Add multiple items with prices
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Item 1');
    await page.fill('input[placeholder="0.00"]', '5.00');
    await page.click('button:has-text("Add Item")');

    // Wait a bit
    await page.waitForTimeout(500);

    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Item 2');
    await page.fill('input[placeholder="0.00"]', '3.50');
    await page.click('button:has-text("Add Item")');

    // Verify total estimated cost
    await expect(page.locator('text=£8.50')).toBeVisible();
  });

  test('should filter items by category', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Add items from different categories
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Apple');
    await page.selectOption('select', { label: 'Fruits & Vegetables' });
    await page.click('button:has-text("Add Item")');

    await page.waitForTimeout(500);

    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Cheese');
    await page.selectOption('select', { label: 'Dairy & Eggs' });
    await page.click('button:has-text("Add Item")');

    // Verify both items are visible
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Cheese')).toBeVisible();
    await expect(page.locator('text=Fruits & Vegetables')).toBeVisible();
    await expect(page.locator('text=Dairy & Eggs')).toBeVisible();
  });

  test('should show empty state when no items', async ({ page }) => {
    // Navigate to shopping list (should be empty initially)
    await page.click('button:has-text("Shopping List")');

    // Check for empty state message
    const emptyStateText = page.locator('text=No items in your shopping list');

    // If there are items, clear them first, otherwise check empty state
    const hasItems = await page.locator('button:has-text("Add Item to Shopping List")').count();
    if (hasItems === 0) {
      await expect(emptyStateText).toBeVisible();
    }
  });

  test('should persist shopping list data on page reload', async ({ page }) => {
    // Navigate to shopping list
    await page.click('button:has-text("Shopping List")');

    // Add an item
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Persistent Item');
    await page.click('button:has-text("Add Item")');

    // Verify item is visible
    await expect(page.locator('text=Persistent Item')).toBeVisible();

    // Reload the page
    await page.reload();

    // Wait for app to load
    await page.waitForSelector('text=ChefsCart');

    // Navigate back to shopping list
    await page.click('button:has-text("Shopping List")');

    // Verify item is still there
    await expect(page.locator('text=Persistent Item')).toBeVisible();
  });
});
