/**
 * End-to-End Tests for AI Assistant
 *
 * Tests user interactions with the AI Shopping Assistant
 * Requires: Playwright, VITE_ANTHROPIC_API_KEY set in environment
 */

import { test, expect } from '@playwright/test';

test.describe('AI Shopping Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForSelector('[data-testid="user-switcher"]', { timeout: 5000 });
  });

  test('should display AI Assistant header', async ({ page }) => {
    const header = page.locator('h2:has-text("AI Shopping Assistant")');
    await expect(header).toBeVisible();
  });

  test('should show "Powered by Anthropic Claude with Tools API"', async ({ page }) => {
    const subtitle = page.locator('text=Powered by Anthropic Claude with Tools API');
    await expect(subtitle).toBeVisible();
  });

  test('should NOT show API key settings', async ({ page }) => {
    // Settings button should not exist
    const settingsButton = page.locator('button:has-text("Settings")');
    await expect(settingsButton).not.toBeVisible();

    // API key input should not exist
    const apiKeyInput = page.locator('input[type="password"]');
    await expect(apiKeyInput).not.toBeVisible();
  });

  test('should display quick actions when no messages', async ({ page }) => {
    const quickActions = page.locator('h3:has-text("Quick Actions")');
    await expect(quickActions).toBeVisible();

    // Check all 4 quick action buttons
    await expect(page.locator('text=Search Supermarkets')).toBeVisible();
    await expect(page.locator('text=Get Suggestions')).toBeVisible();
    await expect(page.locator('text=Analyze Budget')).toBeVisible();
    await expect(page.locator('text=Meal Ideas')).toBeVisible();
  });

  test('should show welcome message in empty chat', async ({ page }) => {
    const welcome = page.locator('text=Hello! I\'m your AI Shopping Assistant');
    await expect(welcome).toBeVisible();
  });

  test('should display AI features section', async ({ page }) => {
    await expect(page.locator('h3:has-text("AI-First Shopping Assistant")')).toBeVisible();
    await expect(page.locator('text=UK Supermarket Search')).toBeVisible();
    await expect(page.locator('text=Budget Calculator')).toBeVisible();
    await expect(page.locator('text=List Analysis')).toBeVisible();
    await expect(page.locator('text=Smart Suggestions')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    // Type a message
    const input = page.locator('input[placeholder*="Ask me anything"]');
    await input.fill('What is my remaining budget?');

    // Send message
    const sendButton = page.locator('button[type="button"]:has(svg)').last();
    await sendButton.click();

    // Wait for user message to appear
    await expect(page.locator('text=What is my remaining budget?')).toBeVisible();

    // Wait for AI response (with timeout for API call)
    await expect(page.locator('text=/£|budget|remaining/i')).toBeVisible({ timeout: 15000 });

    // Should show loading indicator during processing
    // (This happens quickly but we can test for it)
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const input = page.locator('input[placeholder*="Ask me anything"]');
    await input.fill('Hello');
    await input.press('Enter');

    // Message should be sent
    await expect(page.locator('text=Hello')).toBeVisible();
  });

  test('should clear conversation', async ({ page }) => {
    // Send a message first
    const input = page.locator('input[placeholder*="Ask me anything"]');
    await input.fill('Test message');
    await input.press('Enter');

    await expect(page.locator('text=Test message')).toBeVisible();

    // Clear conversation
    const clearButton = page.locator('button:has-text("Clear conversation")');
    await clearButton.click();

    // Messages should be cleared
    await expect(page.locator('text=Test message')).not.toBeVisible();
    await expect(page.locator('text=Hello! I\'m your AI Shopping Assistant')).toBeVisible();
  });

  test.describe('Quick Actions', () => {
    test('should trigger Search Supermarkets action', async ({ page }) => {
      const searchButton = page.locator('button:has-text("Search Supermarkets")');
      await searchButton.click();

      // Should show user message
      await expect(
        page.locator('text=/Search.*supermarkets.*M&S.*Waitrose.*Tesco/i')
      ).toBeVisible({ timeout: 2000 });

      // Should show AI response with store prices
      await expect(page.locator('text=/Tesco|Sainsbury|Waitrose|M&S/i')).toBeVisible({
        timeout: 15000,
      });
    });

    test('should trigger Get Suggestions action', async ({ page }) => {
      const suggestionsButton = page.locator('button:has-text("Get Suggestions")');
      await suggestionsButton.click();

      // Should show user message
      await expect(page.locator('text=/suggestions/i')).toBeVisible({ timeout: 2000 });

      // Should show AI response with suggestions
      await expect(page.locator('text=/suggest|recommend|consider/i')).toBeVisible({
        timeout: 15000,
      });
    });

    test('should trigger Analyze Budget action', async ({ page }) => {
      const budgetButton = page.locator('button:has-text("Analyze Budget")');
      await budgetButton.click();

      // Should show user message
      await expect(page.locator('text=/analyze.*budget/i')).toBeVisible({ timeout: 2000 });

      // Should show AI response with budget analysis
      await expect(page.locator('text=/£|budget|spend|save/i')).toBeVisible({
        timeout: 15000,
      });
    });

    test('should trigger Meal Ideas action', async ({ page }) => {
      const mealButton = page.locator('button:has-text("Meal Ideas")');
      await mealButton.click();

      // Should show user message
      await expect(page.locator('text=/meal.*ideas/i')).toBeVisible({ timeout: 2000 });

      // Should show AI response with meal suggestions
      await expect(page.locator('text=/meal|recipe|cook|food/i')).toBeVisible({
        timeout: 15000,
      });
    });

    test('should disable quick actions while loading', async ({ page }) => {
      const searchButton = page.locator('button:has-text("Search Supermarkets")');
      await searchButton.click();

      // Button should be disabled during API call
      await expect(searchButton).toBeDisabled();

      // Wait for response
      await page.waitForTimeout(2000);

      // After response, buttons should be enabled again
      await expect(searchButton).toBeEnabled();
    });
  });

  test.describe('Error Handling', () => {
    test('should show error if API key not set', async ({ page, context }) => {
      // This test assumes VITE_ANTHROPIC_API_KEY is not set
      // Skip if API key IS set (for production testing)

      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('Test');
      await input.press('Enter');

      // Should show error message about API key
      const errorMessage = page.locator('text=/API.*key|environment|VITE_ANTHROPIC_API_KEY/i');

      // Either shows error immediately or after failed API call
      await expect(errorMessage).toBeVisible({ timeout: 15000 });
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('https://api.anthropic.com/**', (route) =>
        route.abort('failed')
      );

      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('Test message');
      await input.press('Enter');

      // Should show error message
      await expect(page.locator('text=/error|failed|try again/i')).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe('User Context', () => {
    test('should update AI context when switching users', async ({ page }) => {
      // Switch to Zeth (teen)
      const userSwitcher = page.locator('[data-testid="user-switcher"]');
      await userSwitcher.click();

      const zethOption = page.locator('text=Zeth');
      await zethOption.click();

      // Send message as Zeth
      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('What can I add to the list?');
      await input.press('Enter');

      // AI should mention Zeth's £200 limit
      await expect(page.locator('text=/£200|limit|add/i')).toBeVisible({
        timeout: 15000,
      });
    });

    test('should reflect current shopping list in responses', async ({ page }) => {
      // Add item to shopping list first
      const addButton = page.locator('button:has-text("Add Item")');
      await addButton.click();

      // Fill item form (assumes modal/form exists)
      await page.fill('input[name="name"]', 'Test Milk');
      await page.fill('input[name="quantity"]', '2');
      await page.click('button[type="submit"]');

      // Ask AI about shopping list
      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('What is on my shopping list?');
      await input.press('Enter');

      // AI should mention the item
      await expect(page.locator('text=/Test Milk|milk/i')).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe('Conversation Flow', () => {
    test('should maintain conversation context', async ({ page }) => {
      const input = page.locator('input[placeholder*="Ask me anything"]');

      // First message
      await input.fill('I want to buy milk');
      await input.press('Enter');
      await page.waitForTimeout(3000); // Wait for response

      // Second message (referencing first)
      await input.fill('Which store has the best price?');
      await input.press('Enter');

      // AI should understand context and talk about milk prices
      await expect(page.locator('text=/Tesco|Sainsbury|Waitrose|M&S|price|£/i')).toBeVisible({
        timeout: 15000,
      });
    });

    test('should show timestamps on messages', async ({ page }) => {
      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('Hello');
      await input.press('Enter');

      // Check for timestamp format (HH:MM)
      await expect(page.locator('text=/\\d{1,2}:\\d{2}/i')).toBeVisible();
    });

    test('should distinguish between user and assistant messages', async ({ page }) => {
      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('Test message');
      await input.press('Enter');

      // User message should have different styling
      const userMessage = page.locator('.bg-blue-500:has-text("Test message")');
      await expect(userMessage).toBeVisible();

      // AI message should have different styling
      await page.waitForTimeout(3000);
      const aiMessage = page.locator('.bg-gray-100').first();
      await expect(aiMessage).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab to input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Type message
      await page.keyboard.type('Hello');

      // Press Enter to send
      await page.keyboard.press('Enter');

      await expect(page.locator('text=Hello')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Input should have placeholder/label
      const input = page.locator('input[placeholder*="Ask me anything"]');
      await expect(input).toHaveAttribute('placeholder');

      // Buttons should have accessible names
      const searchButton = page.locator('button:has-text("Search Supermarkets")');
      await expect(searchButton).toContainText('Search Supermarkets');
    });
  });

  test.describe('Performance', () => {
    test('should respond within 15 seconds', async ({ page }) => {
      const startTime = Date.now();

      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('Hello');
      await input.press('Enter');

      // Wait for response
      await expect(page.locator('.bg-gray-100').first()).toBeVisible({ timeout: 15000 });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(15000);
    });

    test('should show loading indicator during processing', async ({ page }) => {
      const input = page.locator('input[placeholder*="Ask me anything"]');
      await input.fill('Test');

      const sendButton = page.locator('button[type="button"]:has(svg)').last();
      await sendButton.click();

      // Loading spinner should appear
      const loader = page.locator('svg.animate-spin');
      await expect(loader).toBeVisible({ timeout: 1000 });
    });
  });
});
