# ChefsCart API Documentation

## Overview

This document defines the **unified API** for all ChefsCart functionality. Both the **AI Assistant** and the **UI** must use these APIs consistently to ensure data integrity and feature parity.

---

## Core Principles

1. **Single Source of Truth**: All data operations go through the Zustand store
2. **AI & UI Consistency**: Same operations available to both AI and users
3. **Type Safety**: TypeScript interfaces enforce correct usage
4. **Immutability**: State updates return new objects
5. **Validation**: All inputs validated before state changes

---

## Shopping List API

### Add Item to Shopping List

**Function:** `addShoppingItem(item: Omit<ShoppingItem, 'id'>)`

**Used By:** UI (Add Item Form) + AI Assistant (suggestions)

**Rules:**
- Validates Zeth's £200 monthly limit
- Generates unique ID automatically
- Updates user's `monthlyAddedValue` for teens
- Updates shopping list total

**Example:**
```typescript
// UI Usage
const { addShoppingItem } = useStore();
addShoppingItem({
  name: 'Organic Milk',
  quantity: 2,
  unit: 'liters',
  category: 'Dairy',
  price: 1.45,
  store: 'Tesco',
  addedBy: currentUser.id,
  votes: [],
});

// AI Assistant Usage (via tool)
{
  "tool": "suggest_items",
  "result": [
    {
      "name": "Organic Milk",
      "estimatedPrice": 1.45,
      "reason": "Family essential"
    }
  ]
}
// Then AI prompts user: "Would you like me to add Organic Milk to your list?"
```

**Validation:**
- ✅ Name is required
- ✅ Quantity > 0
- ✅ For teens: Check `monthlyAddedValue + itemCost <= 200`
- ✅ Price is optional but recommended

---

### Remove Item from Shopping List

**Function:** `removeShoppingItem(itemId: string)`

**Used By:** UI (Delete Button) + AI Assistant (optimization suggestions)

**Rules:**
- Only the user who added the item can remove it (or parents)
- Updates user's `monthlyAddedValue` if teen
- Recalculates shopping list total

**Example:**
```typescript
const { removeShoppingItem } = useStore();
removeShoppingItem('item-123');
```

---

### Vote on Item

**Function:** `voteOnItem(itemId: string, userId: string, vote: 'up' | 'down')`

**Used By:** UI (Vote Buttons) + AI Assistant (family suggestions)

**Rules:**
- Each user can vote once per item
- Voting again toggles the vote
- Updates item's vote array

**Example:**
```typescript
const { voteOnItem } = useStore();
voteOnItem('item-123', 'user-1', 'up');
```

---

### Update Item Price

**Function:** `updateItemPrice(itemId: string, newPrice: number, store?: string)`

**Used By:** UI (Edit Form) + AI Assistant (price updates from search)

**Example:**
```typescript
const { updateItemPrice } = useStore();
updateItemPrice('item-123', 1.35, 'Sainsburys');
```

---

## Budget API

### Get Family Budget Status

**Function:** `getFamilyBudgetStatus(): BudgetStatus`

**Used By:** UI (Budget Dashboard) + AI Assistant (budget analysis)

**Returns:**
```typescript
interface BudgetStatus {
  total: number;           // 1000
  spent: number;          // Sum of all users' currentSpent
  remaining: number;      // total - spent
  shoppingListCost: number; // Estimated cost of current list
  projectedTotal: number;  // spent + shoppingListCost
  percentageUsed: number; // (spent / total) * 100
}
```

**Example:**
```typescript
const { getFamilyBudgetStatus } = useStore();
const budget = getFamilyBudgetStatus();
// AI uses this for budget analysis tool
```

---

### Get User Budget Status

**Function:** `getUserBudgetStatus(userId: string): UserBudgetStatus`

**Used By:** UI (User Profile) + AI Assistant (personalized advice)

**Returns:**
```typescript
interface UserBudgetStatus {
  monthlyBudget: number;
  currentSpent: number;
  remaining: number;
  monthlyAddedValue: number; // For Zeth only
  addLimit: number | null;   // 200 for Zeth, null for parents
  canAddMore: number;        // Remaining add capacity
}
```

---

### Calculate Budget Projections

**Tool:** `calculate_budget`

**Used By:** AI Assistant only

**Input:**
```typescript
{
  operation: string;  // "Calculate total", "Project monthly", etc.
  values: {
    [key: string]: number;
  }
}
```

**Output:**
```typescript
{
  operation: string;
  calculations: {
    remaining?: number;
    percentageUsed?: string;
    dailyAverage?: string;
    projectedMonthly?: string;
    // ... more calculations
  };
  context: {
    familyBudget: number;
    spent: number;
    remaining: number;
    itemCount: number;
  }
}
```

---

## Supermarket Search API

### Search UK Supermarkets

**Tool:** `search_uk_supermarkets`

**Used By:** AI Assistant only (UI shows results)

**Supermarkets:**
1. **M&S** (Marks & Spencer) - Premium quality
2. **Waitrose** - High quality, myWaitrose deals
3. **Tesco** - All-round, Clubcard savings
4. **Sainsbury's** - Good value, Nectar points

**Input:**
```typescript
{
  item: string;              // "milk", "chicken breast", etc.
  stores?: string[];         // Default: all 4 stores
  max_price?: number;        // Optional price filter
}
```

**Output:**
```typescript
{
  item: string;
  stores_searched: string[];
  prices: {
    [store: string]: {
      price: number | string;
      deals?: string;
      quality?: string;
    }
  };
  recommendation: string;
  within_budget?: Array<[string, any]>;
}
```

**Example:**
```typescript
// AI searches for milk prices
{
  "item": "milk",
  "stores": ["Tesco", "Sainsburys", "Waitrose", "M&S"]
}

// Response:
{
  "item": "milk",
  "stores_searched": ["Tesco", "Sainsburys", "Waitrose", "M&S"],
  "prices": {
    "Tesco": { "price": 1.45, "deals": "Clubcard price" },
    "Sainsburys": { "price": 1.50 },
    "Waitrose": { "price": 1.65 },
    "M&S": { "price": 1.75 }
  },
  "recommendation": "Best price: Tesco at £1.45"
}
```

---

## Shopping List Analysis API

### Analyze Shopping List

**Tool:** `analyze_shopping_list`

**Used By:** AI Assistant only (UI shows insights)

**Focus Areas:**
- `budget` - Cost analysis and savings opportunities
- `health` - Nutritional balance and healthy alternatives
- `completeness` - Missing essentials check
- `optimization` - Duplicate items, better alternatives

**Input:**
```typescript
{
  focus: 'budget' | 'health' | 'completeness' | 'optimization'
}
```

**Output:**
```typescript
{
  focus: string;
  itemCount: number;
  insights: string[];
  // Focus-specific fields:
  totalCost?: string;
  budgetImpact?: string;
  categories?: { [key: string]: number };
  hasEssentials?: string[];
  missingEssentials?: string[];
}
```

---

## Item Suggestions API

### Suggest Items

**Tool:** `suggest_items`

**Used By:** AI Assistant only (UI displays suggestions)

**Categories:**
- `essentials` - Milk, bread, eggs, butter, vegetables
- `healthy snacks` - Fresh fruit, yogurt, nuts, hummus
- `meal ingredients` - Chicken, pasta, sauces, seasonings

**Input:**
```typescript
{
  category: string;
  count?: number;  // Default: 5
}
```

**Output:**
```typescript
{
  category: string;
  items: Array<{
    name: string;
    estimatedPrice: number;
    reason: string;
  }>;
  estimatedTotal: string;
}
```

---

## User Management API

### Switch User

**Function:** `setCurrentUser(userId: string)`

**Used By:** UI (User Switcher) + AI Assistant (personalization)

**Rules:**
- Updates current user context
- AI Assistant context updates automatically via `setContext()`

**Example:**
```typescript
const { setCurrentUser } = useStore();
setCurrentUser('user-3'); // Switch to Zeth
```

---

### Get User Profile

**Function:** `getCurrentUser(): User | null`

**Returns:**
```typescript
interface User {
  id: string;
  name: string;              // "Stephen", "Cheslyn", "Zeth"
  role: UserRole;            // 'parent1', 'parent2', 'teen'
  avatar?: string;
  monthlyBudget: number;     // 1000 for all (shared pot)
  currentSpent: number;
  monthlyAddedValue: number; // Tracking for Zeth's £200 limit
  points: number;
  level: number;
  badges: Badge[];
  preferences: UserPreferences;
}
```

---

## Gamification API

### Award Points

**Function:** `awardPoints(userId: string, points: number, reason: string)`

**Used By:** UI (Actions) + AI Assistant (achievements)

**Point Values:**
- Add healthy item: +10 points
- Complete weekly shop: +50 points
- Stay under budget: +100 points
- Vote on item: +5 points

---

### Unlock Badge

**Function:** `unlockBadge(userId: string, badge: Badge)`

**Used By:** System triggers + AI Assistant (recognition)

**Badge Types:**
- `budget-master` - Stay under budget 3 months
- `health-champion` - 50% healthy items
- `team-player` - Vote on 20 items
- `deal-hunter` - Save £100 via AI suggestions

---

## AI Assistant Chat API

### Initialize Assistant

**Function:** `createShoppingAssistant(apiKey: string)`

**Used By:** UI (AIAssistant.tsx component)

**Example:**
```typescript
import { createShoppingAssistant } from '@agents/shoppingAssistant';

const assistant = createShoppingAssistant(
  import.meta.env.VITE_ANTHROPIC_API_KEY
);
```

---

### Set Context

**Function:** `assistant.setContext(context: ShoppingContext)`

**Used By:** UI (AIAssistant.tsx) - auto-updates on state changes

**Context:**
```typescript
interface ShoppingContext {
  currentUser: User;
  users: User[];
  shoppingList: ShoppingItem[];
  budget: number;
}
```

**Example:**
```typescript
useEffect(() => {
  if (assistant && currentUser) {
    assistant.setContext({
      currentUser,
      users,
      shoppingList: shoppingList.items,
      budget: currentUser.monthlyBudget - currentUser.currentSpent,
    });
  }
}, [assistant, currentUser, users, shoppingList]);
```

---

### Send Message

**Function:** `assistant.chat(message: string): Promise<string>`

**Used By:** UI (chat input) + Quick Actions

**Example:**
```typescript
const response = await assistant.chat(
  "Can you analyze my budget and suggest ways to save money?"
);
```

---

## Future APIs (Phase 2 & 3)

### Purchase History API

**Function:** `addPurchase(items: ShoppingItem[], receipt?: File)`

**Purpose:** Track actual purchases vs shopping list

**Vision Integration:**
```typescript
// Upload receipt photo
const items = await assistant.scanReceipt(receiptImage);
addPurchase(items, receiptFile);
```

---

### Inventory Management API

**Function:** `updateInventory(items: InventoryItem[])`

**Purpose:** Track what's in the pantry/fridge

**Vision Integration:**
```typescript
// Take photo of pantry
const inventory = await assistant.scanPantry(pantryImage);
updateInventory(inventory);
```

---

### Predictive Replenishment API

**Function:** `getPredictiveList(): ShoppingItem[]`

**Purpose:** AI predicts what needs restocking

**Based On:**
- Purchase history
- Consumption patterns
- Family size and preferences
- Seasonal trends

---

## Error Handling

### Standard Error Responses

All APIs should return errors in this format:

```typescript
interface APIError {
  error: string;
  code: 'BUDGET_EXCEEDED' | 'INVALID_INPUT' | 'NOT_FOUND' | 'PERMISSION_DENIED';
  details?: any;
}
```

**Common Errors:**
- `BUDGET_EXCEEDED` - Zeth trying to add > £200 worth
- `INVALID_INPUT` - Missing required fields
- `NOT_FOUND` - Item/user doesn't exist
- `PERMISSION_DENIED` - User can't perform action

---

## Testing Requirements

All APIs must have:
1. Unit tests for core logic
2. Integration tests for state updates
3. E2E tests for user workflows
4. AI tool tests for correct outputs

See `tests/api.test.ts` for comprehensive test suite.

---

## Versioning

**Current Version:** 1.0.0

**Breaking Changes:**
- Document all breaking changes here
- Increment major version for breaking changes
- Maintain backward compatibility when possible

---

## Support

**Questions?** See:
- `/docs/Claude.md` - AI model documentation
- `/src/store.ts` - State management implementation
- `/agents/shoppingAssistant.ts` - AI Assistant implementation
- `/tests/` - Test examples
