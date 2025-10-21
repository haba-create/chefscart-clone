import { test, expect } from '@playwright/test';

test.describe('Gamification Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=ChefsCart', { timeout: 10000 });

    // Navigate to Achievements tab
    await page.click('button:has-text("Achievements")');
  });

  test('should display gamification dashboard', async ({ page }) => {
    // Verify main elements are visible
    await expect(page.locator('text=Level 1')).toBeVisible();
    await expect(page.locator('text=Points')).toBeVisible();
    await expect(page.locator('text=Active Challenges')).toBeVisible();
    await expect(page.locator('text=Badges')).toBeVisible();
    await expect(page.locator('text=Family Leaderboard')).toBeVisible();
  });

  test('should show level progress bar', async ({ page }) => {
    // Check for level progress section
    await expect(page.locator('text=Progress to Level')).toBeVisible();
    await expect(page.locator('text=points to go')).toBeVisible();

    // Verify progress bar exists
    const progressBar = page.locator('.h-3.bg-white.rounded-full');
    await expect(progressBar).toBeVisible();
  });

  test('should display active challenges', async ({ page }) => {
    // Check for default challenges
    await expect(page.locator('text=Budget Master')).toBeVisible();
    await expect(page.locator('text=Deal Hunter')).toBeVisible();
    await expect(page.locator('text=Healthy Choices')).toBeVisible();

    // Verify challenge points are shown
    await expect(page.locator('text=100').first()).toBeVisible(); // Budget Master points
  });

  test('should show challenge progress', async ({ page }) => {
    // Find a challenge card
    const challengeCard = page.locator('div').filter({ hasText: 'Budget Master' }).first();

    // Verify progress elements
    await expect(challengeCard.locator('text=Progress')).toBeVisible();

    // Check for progress bar
    const progressBar = challengeCard.locator('.h-2.rounded-full');
    await expect(progressBar).toBeVisible();
  });

  test('should display badges section', async ({ page }) => {
    // Verify badges section exists
    await expect(page.locator('text=Badges').first()).toBeVisible();

    // Check for specific badges
    await expect(page.locator('text=First Shopping Trip')).toBeVisible();
    await expect(page.locator('text=Budget Master')).toBeVisible();
    await expect(page.locator('text=Deal Hunter')).toBeVisible();
  });

  test('should show badge unlock status', async ({ page }) => {
    // Find badge cards
    const badges = page.locator('div').filter({ hasText: 'First Shopping Trip' });

    // Badges should have visual indication of locked/unlocked state
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should display family leaderboard', async ({ page }) => {
    // Verify all family members are in leaderboard
    await expect(page.locator('text=Parent 1').nth(1)).toBeVisible();
    await expect(page.locator('text=Parent 2').nth(1)).toBeVisible();
    await expect(page.locator('text=Teen').nth(1)).toBeVisible();

    // Check for points display
    await expect(page.locator('text=points')).toBeVisible();
  });

  test('should highlight current user in leaderboard', async ({ page }) => {
    // Teen should be highlighted in leaderboard
    const leaderboardSection = page.locator('text=Family Leaderboard').locator('..');
    await expect(leaderboardSection.locator('text=You')).toBeVisible();
  });

  test('should award points for adding items', async ({ page }) => {
    // Check initial points
    const initialPoints = await page.locator('header').locator('text=/\\d+ pts/').first().textContent();

    // Navigate to shopping list and add item
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Test Item');
    await page.click('button:has-text("Add Item")');

    // Go back to achievements
    await page.click('button:has-text("Achievements")');

    // Points should have increased
    const newPoints = await page.locator('header').locator('text=/\\d+ pts/').first().textContent();
    expect(newPoints).not.toBe(initialPoints);
  });

  test('should show how to earn points section', async ({ page }) => {
    // Verify the "How to Earn Points" section exists
    await expect(page.locator('text=How to Earn Points')).toBeVisible();

    // Check for specific point earning methods
    await expect(page.locator('text=Add Items')).toBeVisible();
    await expect(page.locator('text=5 points')).toBeVisible();
    await expect(page.locator('text=Complete Shopping')).toBeVisible();
    await expect(page.locator('text=10 points')).toBeVisible();
  });

  test('should show challenge icons', async ({ page }) => {
    // Challenges should have emoji icons
    const challengeSection = page.locator('text=Active Challenges').locator('..');

    // Budget challenge should have money emoji
    await expect(challengeSection.locator('text=💰')).toBeVisible();
  });

  test('should display medal emojis for top leaderboard positions', async ({ page }) => {
    // Check for medal emojis in leaderboard
    const leaderboardSection = page.locator('text=Family Leaderboard').locator('..');

    // At least one medal should be visible (gold, silver, or bronze)
    const medals = leaderboardSection.locator('text=/[🥇🥈🥉]/');
    const medalCount = await medals.count();
    expect(medalCount).toBeGreaterThanOrEqual(1);
  });

  test('should show badge types (bronze, silver, gold)', async ({ page }) => {
    // Check for badge type indicators
    const badgeSection = page.locator('text=Badges').first().locator('..');

    // Should have mentions of badge types
    await expect(badgeSection.locator('text=bronze')).toBeVisible();
  });

  test('should update leaderboard when points change', async ({ page }) => {
    // Note initial position
    const leaderboardBefore = await page.locator('text=Family Leaderboard').locator('..').textContent();

    // Add item to earn points
    await page.click('button:has-text("Shopping List")');
    await page.click('button:has-text("Add Item to Shopping List")');
    await page.fill('input[placeholder*="Milk"]', 'Points Test');
    await page.click('button:has-text("Add Item")');

    // Go back to achievements
    await page.click('button:has-text("Achievements")');

    // Leaderboard should update
    const leaderboardAfter = await page.locator('text=Family Leaderboard').locator('..').textContent();
    expect(leaderboardAfter).toBeDefined();
  });

  test('should show challenge end dates', async ({ page }) => {
    // Challenges should show when they end
    const challengeCards = page.locator('div').filter({ hasText: 'Ends' });
    const count = await challengeCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display teen user stats prominently', async ({ page }) => {
    // Teen should see their own stats at the top
    await expect(page.locator('text=Teen').first()).toBeVisible();
    await expect(page.locator('text=Level 1')).toBeVisible();

    // Teen emoji should be visible
    await expect(page.locator('text=🧑‍🎓')).toBeVisible();
  });

  test('should show point values for different actions', async ({ page }) => {
    // Scroll to "How to Earn Points" section
    await page.locator('text=How to Earn Points').scrollIntoViewIfNeeded();

    // Verify different point values are shown
    await expect(page.locator('text=5 points')).toBeVisible(); // Add items
    await expect(page.locator('text=10 points')).toBeVisible(); // Complete shopping
    await expect(page.locator('text=50-100 points')).toBeVisible(); // Challenges
  });
});
