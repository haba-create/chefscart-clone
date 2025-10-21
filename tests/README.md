# ChefsCart Test Suite

## Overview

Comprehensive test suite for the ChefsCart AI-First Shopping Application.

## Test Structure

```
tests/
├── shoppingAssistant.test.ts  # Unit & integration tests for AI agent
├── e2e/
│   └── aiAssistant.spec.ts   # End-to-end tests for AI Assistant UI
└── README.md                  # This file
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test shoppingAssistant.test.ts
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e aiAssistant.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

## Environment Setup

### Required Environment Variables

```bash
# For AI Assistant tests
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Test Configuration

Create `.env.test` for test-specific configuration:

```bash
VITE_ANTHROPIC_API_KEY=your-test-api-key
```

## Test Coverage

### Unit Tests (`shoppingAssistant.test.ts`)

✅ **Constructor Tests**
- Valid API key initialization
- Error handling for missing/invalid API keys

✅ **Context Management**
- Setting shopping context
- Updating context
- Context validation

✅ **Chat Functionality**
- Message sending/receiving
- Tool execution loop
- Error handling (401, 429, network)
- Model verification (claude-sonnet-4-5-20250929)

✅ **Budget Calculator Tool**
- Remaining budget calculation
- Percentage calculations
- Average cost per item
- Monthly spending projections
- Error handling

✅ **Supermarket Search Tool**
- Price comparison across stores (M&S, Waitrose, Tesco, Sainsbury's)
- Store filtering
- Max price filtering
- Unknown item handling
- Deal information

✅ **Shopping List Analysis Tool**
- Budget impact analysis
- Health analysis
- Completeness check
- Budget exceeded warnings
- Category breakdown

✅ **Item Suggestions Tool**
- Essential items suggestions
- Healthy snacks suggestions
- Meal ingredients suggestions
- Category fallback
- Total cost calculation

✅ **System Prompt**
- Context inclusion
- Family details
- User-specific information (Zeth's £200 limit)
- Budget breakdown
- Shopping list cost

### E2E Tests (`aiAssistant.spec.ts`)

✅ **UI Elements**
- Header and branding
- No API key settings (environment only)
- Quick actions visibility
- Welcome message
- Features section

✅ **User Interactions**
- Sending messages
- Receiving responses
- Keyboard navigation (Enter key)
- Clear conversation

✅ **Quick Actions**
- Search Supermarkets
- Get Suggestions
- Analyze Budget
- Meal Ideas
- Button states (enabled/disabled)

✅ **Error Handling**
- Missing API key
- Network failures
- Graceful error messages

✅ **User Context**
- User switching
- Context updates
- Shopping list reflection
- User-specific responses (Zeth's limit)

✅ **Conversation Flow**
- Context maintenance
- Timestamps
- Message styling
- Multi-turn conversations

✅ **Accessibility**
- Keyboard navigation
- ARIA labels
- Focus management

✅ **Performance**
- Response time < 15s
- Loading indicators
- Smooth interactions

## Test Data

### Mock Users

**Stephen (Parent 1)**
```typescript
{
  id: 'user-1',
  name: 'Stephen',
  role: 'parent1',
  monthlyBudget: 1000,
  currentSpent: 300,
  monthlyAddedValue: 0,
}
```

**Cheslyn (Parent 2)**
```typescript
{
  id: 'user-2',
  name: 'Cheslyn',
  role: 'parent2',
  monthlyBudget: 1000,
  currentSpent: 200,
  monthlyAddedValue: 0,
}
```

**Zeth (Teen)**
```typescript
{
  id: 'user-3',
  name: 'Zeth',
  role: 'teen',
  monthlyBudget: 1000,
  currentSpent: 100,
  monthlyAddedValue: 150,  // £200 limit
}
```

### Mock Shopping Items

```typescript
[
  {
    id: 'item-1',
    name: 'Milk',
    quantity: 2,
    unit: 'liters',
    category: 'Dairy',
    price: 1.45,
    store: 'Tesco',
    addedBy: 'user-1',
  },
  {
    id: 'item-2',
    name: 'Bread',
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    price: 0.95,
    store: 'Sainsburys',
    addedBy: 'user-1',
  }
]
```

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator('button:has-text("Click Me")');

    // Act
    await button.click();

    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

## Continuous Integration

Tests run automatically on:
- Every commit (via pre-commit hook)
- Every pull request
- Before deployment to Railway

## Debugging Failed Tests

### Unit Tests

```bash
# Run with verbose output
npm run test -- --reporter=verbose

# Run single test
npm run test -- -t "should calculate budget"

# Update snapshots
npm run test -- -u
```

### E2E Tests

```bash
# Run in debug mode
npm run test:e2e -- --debug

# Show trace viewer for failed tests
npx playwright show-report

# Run in headed mode
npm run test:e2e -- --headed

# Run with specific browser
npm run test:e2e -- --project=chromium
```

## Best Practices

1. **Test Naming**: Use descriptive `it('should ...')` statements
2. **Test Independence**: Each test should be independent
3. **Mock External APIs**: Use mocks for Anthropic API in unit tests
4. **Real API for E2E**: E2E tests use real API (with test key)
5. **Clean Up**: Always clean up test data after tests
6. **Async Handling**: Use proper async/await for all async operations
7. **Accessibility**: Test keyboard navigation and screen readers
8. **Error Cases**: Always test error handling

## Troubleshooting

### "API key not found" Error

```bash
# Ensure environment variable is set
echo $VITE_ANTHROPIC_API_KEY

# For Railway deployment
railway env set VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### "Test timeout" Error

```bash
# Increase timeout in test
test('...', async ({ page }) => {
  test.setTimeout(30000); // 30 seconds
});
```

### "Element not found" Error

```bash
# Add proper waits
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 });
```

## Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: All critical user workflows

## Contributing

When adding new features:

1. Write unit tests first (TDD)
2. Add integration tests for API changes
3. Add E2E tests for UI changes
4. Ensure all tests pass before committing
5. Update this README if adding new test files

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Claude API Documentation](https://docs.claude.com/en/home)
