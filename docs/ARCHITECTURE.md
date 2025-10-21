# ChefsCart Architecture Documentation

**Last Updated:** 2025-10-21
**Version:** 2.0 (Post-Trolley Refactoring)

---

## Table of Contents

1. [Overview](#overview)
2. [Core Philosophy](#core-philosophy)
3. [Data Persistence Strategy](#data-persistence-strategy)
4. [State Management](#state-management)
5. [Component Architecture](#component-architecture)
6. [AI Integration](#ai-integration)
7. [Real-Time Pricing Roadmap](#real-time-pricing-roadmap)
8. [Purchase History](#purchase-history)
9. [Future Enhancements](#future-enhancements)

---

## Overview

ChefsCart is an **AI-first grocery shopping application** designed for London families. The application has undergone a major architectural refactoring (Version 2.0) to support:

- **Dynamic pricing** (real-time search capability)
- **Purchase history tracking**
- **Leaner state management** (only persist essential data)
- **Preparation for specialized pricing agent**

### Key Terminology Change

**Version 1.0:** "Shopping List"
**Version 2.0:** "Trolley" (UK-specific terminology)

---

## Core Philosophy

### AI-First Design

```
  AI Assistant (33% Screen)          Main Application (67% Screen)
  ┌─────────────────────┐            ┌─────────────────────────┐
  │                     │            │                         │
  │  🤖 Always Visible  │            │  Trolley, Meals,       │
  │                     │            │  Budget, Achievements   │
  │  Quick Actions      │            │                         │
  │  Chat Interface     │            │                         │
  │                     │            │                         │
  └─────────────────────┘            └─────────────────────────┘
```

**Principles:**
1. **AI is always accessible** - Split-screen layout keeps AI visible
2. **AI can do everything UI can do** - Feature parity goal
3. **Real-time data over static** - Move toward live pricing
4. **Purchase history informs future decisions** - Learning system

---

## Data Persistence Strategy

### What Gets Persisted (localStorage)

Only **user-generated data** is persisted:

```typescript
{
  trolley: Trolley,           // User's shopping cart
  purchaseHistory: PurchaseHistory  // Past purchases
}
```

### What Doesn't Get Persisted

Everything else resets on page refresh:

- **Users** - Reloaded from defaults
- **Challenges** - Reset each session
- **AI Messages** - Fresh conversation each session
- **Meal Plans** - Temporary planning
- **Notifications** - Session-based

### Rationale

**Before (Version 1.0):**
```typescript
// Everything persisted to localStorage
{
  currentUser,
  users,
  shoppingList,      // ← Became stale
  challenges,
  mealPlan,
  aiMessages,        // ← Grew indefinitely
  notifications,
}
```

**Problems:**
- LocalStor age grew unbounded
- Stale data never refreshed
- No mechanism for real-time updates
- Harder to add real-time pricing

**After (Version 2.0):**
```typescript
// Only essentials persisted
persist: {
  trolley,           // ← User's current cart
  purchaseHistory,   // ← Purchase records
}
```

**Benefits:**
- ✅ Lean localStorage (only ~5-10KB typically)
- ✅ Fresh data each session (users, challenges from server/defaults)
- ✅ Easy to add real-time pricing (no stale cache)
- ✅ Purchase history preserved for AI learning

---

## State Management

### Zustand Store Structure

```typescript
interface AppState {
  // Persistent (localStorage)
  trolley: Trolley                    // PERSISTED
  purchaseHistory: PurchaseHistory    // PERSISTED

  // Session-based (resets on refresh)
  currentUser: User | null
  users: User[]
  challenges: Challenge[]
  mealPlan: MealPlan | null
  aiMessages: AIMessage[]
  notifications: Notification[]

  // Trolley Actions
  addTrolleyItem()
  removeTrolleyItem()
  updateTrolleyItem()
  toggleItemPurchased()
  voteOnItem()

  // Purchase History Actions
  moveTrolleyItemToPurchaseHistory()
  addToPurchaseHistory()
  clearPurchaseHistory()

  // Other Actions...
}
```

### Trolley vs ShoppingList (Legacy)

**Type Definitions:**

```typescript
// New (Version 2.0)
interface Trolley {
  id: string
  items: TrolleyItem[]
  lastUpdated: Date
  totalEstimatedCost: number
  budgetRemaining: number
}

interface TrolleyItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  price?: number         // Optional - may come from real-time search
  store?: string         // Optional - AI can suggest best store
  addedBy: string
  addedAt: Date
  purchased: boolean
  notes?: string
  votes: ItemVote[]
  urgency: 'low' | 'medium' | 'high'
}

// Legacy aliases (for backward compatibility)
type ShoppingList = Trolley
type ShoppingItem = TrolleyItem
```

**Key Changes:**
- `store` field now optional (allows AI to suggest best store dynamically)
- `price` remains optional (supports real-time price lookup)
- Terminology: "Trolley" more natural for UK users

---

## Component Architecture

### File Structure

```
components/
├── Trolley.tsx              ← Main shopping cart (renamed from ShoppingList)
├── AIAssistant.tsx          ← 33% left sidebar, always visible
├── BudgetTracker.tsx        ← Budget analysis
├── MealPlanner.tsx          ← Meal planning
├── Gamification.tsx         ← Points, badges, achievements
├── Header.tsx               ← App header
└── UserSwitcher.tsx         ← Family member switcher
```

### Component Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│  (Split Screen: AI 33% | Main 67%)                      │
└──────────────────┬──────────────────┬───────────────────┘
                   │                  │
        ┌──────────▼────────┐  ┌──────▼───────────┐
        │  AIAssistant      │  │   Main Content    │
        │  (Left Panel)     │  │   (Right Panel)   │
        │                   │  │                   │
        │  - Uses trolley   │  │  - Trolley.tsx    │
        │  - Adds items     │  │  - BudgetTracker  │
        │  - Web search (🔜)│  │  - MealPlanner    │
        └───────────────────┘  └───────────────────┘
                   │                  │
                   └────────┬─────────┘
                            │
                     ┌──────▼───────┐
                     │  Zustand     │
                     │  State Store │
                     └──────┬───────┘
                            │
                   ┌────────▼─────────┐
                   │  localStorage    │
                   │  (trolley +      │
                   │   purchaseHistory│
                   └──────────────────┘
```

---

## AI Integration

### AI Shopping Assistant (`agents/shoppingAssistant.ts`)

**Tools Available:**

1. **`calculate_budget`**
   - Budget calculations
   - Spending analysis
   - Projections

2. **`search_uk_supermarkets`** ⚠️ Currently uses static database
   - Search grocery items
   - Compare prices across stores
   - **TODO:** Integrate real-time web search

3. **`analyze_shopping_list`**
   - Budget impact analysis
   - Health assessment
   - Completeness check

4. **`suggest_items`**
   - Intelligent recommendations
   - Based on family patterns
   - Budget-aware

5. **`add_to_shopping_list`**
   - Add items directly from AI chat
   - Updates trolley state
   - Enforces Zeth's £200 limit

### AI Context

```typescript
interface ShoppingContext {
  currentUser: User
  users: User[]
  trolley: TrolleyItem[]        // ← Updated from shoppingList
  budget: number
  addItem?: (item: Omit<TrolleyItem, 'id' | 'addedAt' | 'votes'>) => void
}
```

**AI receives:**
- Current user info (name, role, budget)
- Full trolley contents
- Remaining budget
- Ability to add items to trolley

**AI can:**
- ✅ Search grocery prices (static DB currently)
- ✅ Calculate budgets
- ✅ Analyze trolley
- ✅ Suggest items
- ✅ Add items to trolley
- 🔜 Search real-time prices (planned)
- 🔜 Learn from purchase history (planned)

---

## Real-Time Pricing Roadmap

### Current State (Version 2.0)

**Static Grocery Database:**
```typescript
// src/data/groceries.ts
export interface GroceryItem {
  id: string
  name: string
  category: string
  unit: string
  prices: {
    Ocado?: number
    Tesco?: number
    Sainsburys?: number
    Waitrose?: number
    'M&S'?: number
  }
  averagePrice: number
  bestStore: string
  bestPrice: number
  organic?: boolean
  deals?: Deal[]
}

// 67 items with static prices
export const GROCERY_DATABASE: GroceryItem[] = [...]
```

**Limitations:**
- ❌ Prices are hardcoded
- ❌ No real-time updates
- ❌ Limited product catalog (67 items)
- ❌ Deals/promotions manually maintained

### Phase 1: Web Search Integration (Next Sprint)

**Goal:** Enable AI to search web for current UK supermarket prices

**Implementation:**

```typescript
// agents/shoppingAssistant.ts

const TOOLS: Anthropic.Tool[] = [
  // ...existing tools
  {
    name: 'search_live_uk_prices',
    description: 'Search the web for current prices of grocery items across UK supermarkets in real-time',
    input_schema: {
      type: 'object',
      properties: {
        item: {
          type: 'string',
          description: 'Item to search for (e.g., "Tesco organic milk 2L")'
        },
        stores: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific stores to search (Ocado, Tesco, Sainsbury\'s, Waitrose, M&S)'
        }
      },
      required: ['item']
    }
  }
];

// Handler function
private async searchLiveUKPrices(input: any): Promise<any> {
  const { item, stores } = input;

  // Use WebSearch tool or external API
  const query = stores
    ? `${item} price ${stores.join(' OR ')} UK`
    : `${item} price Ocado Tesco Sainsbury Waitrose M&S UK`;

  // Web search implementation (requires WebSearch access)
  const results = await this.webSearch(query);

  // Parse results and extract prices
  return {
    item,
    prices: parsedPrices,
    bestDeal: cheapestOption,
    timestamp: new Date()
  };
}
```

**Benefits:**
- ✅ Real-time pricing
- ✅ Current deals/promotions
- ✅ Unlimited product catalog
- ✅ Accurate availability

**Challenges:**
- Parsing web results (HTML scraping complexity)
- Rate limiting / API costs
- Data consistency (different store formats)

### Phase 2: Specialized Pricing Agent (Future)

**User's Vision:**
> "In the future we will have an agent specialized in going online and getting the best prices based on what has been bought before"

**Architecture:**

```typescript
// agents/pricingAgent.ts

export class SmartPricingAgent {
  constructor(
    private apiKey: string,
    private purchaseHistory: PurchaseHistory
  ) {}

  /**
   * Learn from purchase history to find best deals
   */
  async findBestPrices(
    items: string[]
  ): Promise<PriceComparison[]> {
    // 1. Analyze purchase history
    const patterns = this.analyzePurchasePatterns();

    // 2. Search web for current prices
    const livePrices = await this.searchMultipleSources(items);

    // 3. Apply learned preferences
    // - Preferred stores
    // - Brand preferences
    // - Quality vs price tradeoffs

    // 4. Consider bulk discounts based on history

    // 5. Return optimized recommendations
    return recommendations;
  }

  private analyzePurchasePatterns(): PurchasePatterns {
    // Analyze:
    // - Which stores used most often?
    // - What items bought regularly?
    // - Price sensitivity per category
    // - Preferred brands
    // - Seasonal patterns
  }
}
```

**Features:**
- 🎯 **Purchase History Learning**
  - Regular items auto-suggested
  - Preferred stores identified
  - Price sensitivity per category

- 🔍 **Multi-Source Search**
  - Ocado API
  - Tesco API
  - Sainsbury's scraping
  - Waitrose scraping
  - M&S scraping

- 💡 **Smart Recommendations**
  - "You usually buy X from Tesco, but it's £1 cheaper at Ocado this week"
  - "Buy 2 for £5 deal on your regular pasta at Sainsbury's"
  - "Your usual milk is out of stock at Waitrose, try Tesco instead"

- 📊 **Analytics**
  - Monthly spending trends
  - Savings achieved
  - Store comparison stats

**Implementation Roadmap:**

```
Phase 2.1: Purchase History Analysis
├── Track which stores used most
├── Identify regular purchases
├── Calculate average prices paid
└── Build preference model

Phase 2.2: Multi-Store API Integration
├── Ocado API integration
├── Tesco API integration
├── Sainsbury's web scraping
├── Waitrose web scraping
└── M&S web scraping

Phase 2.3: Smart Agent
├── ML model for price predictions
├── Deal detection algorithms
├── Substitution recommendations
└── Bulk buying optimization

Phase 2.4: Autonomous Shopping
├── Auto-generate weekly trolley
├── One-click approve and order
├── Schedule deliveries
└── Budget optimization
```

---

## Purchase History

### Data Structure

```typescript
interface PurchaseHistory {
  id: string
  purchases: PurchasedItem[]
  lastUpdated: Date
  totalSpent: number
}

interface PurchasedItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  price: number              // Actual price paid
  store: string              // Where it was purchased
  purchasedBy: string        // Who bought it
  purchasedAt: Date          // When purchased
  addedBy: string            // Who added to trolley
  notes?: string
}
```

### Usage

**Moving from Trolley to History:**
```typescript
// When item is marked as purchased AND has store/price
store.moveTrolleyItemToPurchaseHistory(itemId)
```

**Direct Addition:**
```typescript
// For manual entry or imports
store.addToPurchaseHistory({
  name: 'Milk',
  quantity: 2,
  unit: 'L',
  category: 'Dairy',
  price: 2.50,
  store: 'Tesco',
  purchasedBy: 'user-1',
  purchasedAt: new Date(),
  addedBy: 'user-1'
})
```

**Future AI Analysis:**
```typescript
// Pricing agent can analyze:
- Most frequently purchased items
- Preferred stores per category
- Average prices paid
- Seasonal patterns
- Deal effectiveness
```

---

## Future Enhancements

### Short Term (Next Sprint)

1. **Real-Time Web Search Integration**
   - Add web search tool to AI assistant
   - Parse UK supermarket prices from web
   - Cache results to reduce API calls

2. **Enhanced Purchase History UI**
   - Purchase history view component
   - Spending analytics
   - Export to CSV

3. **Improved Trolley Features**
   - Drag & drop reordering
   - Bulk operations (delete, categorize)
   - Smart categorization

### Medium Term (1-2 Months)

1. **Specialized Pricing Agent**
   - Separate agent for price optimization
   - Learn from purchase history
   - Multi-store API integration

2. **Recipe Integration**
   - Link meal plans to trolley
   - Auto-add ingredients
   - Portion calculator

3. **Store Delivery Integration**
   - Ocado API for real orders
   - Delivery slot booking
   - Order tracking

### Long Term (3-6 Months)

1. **Autonomous Shopping**
   - AI generates full weekly trolley
   - One-click approve & order
   - Automatic reordering of staples

2. **Household Inventory**
   - Track what's in cupboards/fridge
   - Expiry date tracking
   - Auto-suggest based on inventory

3. **Social Features**
   - Share lists with other families
   - Group buying for bulk discounts
   - Community deal sharing

---

## Technical Decisions

### Why Zustand Over Redux?

- Simpler API
- Less boilerplate
- Built-in TypeScript support
- Persist middleware out-of-box

### Why Not Persist Everything?

**Before:**
- localStorage grew to 100KB+
- Stale data persisted indefinitely
- No refresh mechanism

**After:**
- localStorage ~5-10KB
- Fresh defaults each session
- Only user data persists

### Why Partial Persist?

```typescript
partialize: (state) => ({
  trolley: state.trolley,
  purchaseHistory: state.purchaseHistory,
})
```

**Benefits:**
- User's trolley never lost
- Purchase history preserved
- Everything else fresh from defaults/APIs
- Easy to add real-time data sources

---

## Migration Guide

### Upgrading from Version 1.0

**localStorage Changes:**

```javascript
// Version 1.0 structure
{
  "chefscart-storage": {
    "state": {
      "shoppingList": { ... },
      "users": [ ... ],
      // ... everything
    },
    "version": 0
  }
}

// Version 2.0 structure
{
  "chefscart-storage": {
    "state": {
      "trolley": { ... },          // ← renamed from shoppingList
      "purchaseHistory": { ... }   // ← new
    },
    "version": 0
  }
}
```

**Breaking Changes:**
- ❌ `shoppingList` → `trolley`
- ❌ `ShoppingItem` → `TrolleyItem`
- ❌ `addShoppingItem()` → `addTrolleyItem()`
- ❌ `removeShoppingItem()` → `removeTrolleyItem()`

**Migration Script (if needed):**
```typescript
// Convert old localStorage to new format
const oldData = localStorage.getItem('chefscart-storage');
if (oldData) {
  const parsed = JSON.parse(oldData);
  if (parsed.state.shoppingList) {
    parsed.state.trolley = parsed.state.shoppingList;
    delete parsed.state.shoppingList;
    // Keep only trolley, discard rest
    parsed.state = {
      trolley: parsed.state.trolley,
      purchaseHistory: { id: 'history-1', purchases: [], lastUpdated: new Date(), totalSpent: 0 }
    };
    localStorage.setItem('chefscart-storage', JSON.stringify(parsed));
  }
}
```

---

## Performance Considerations

### Bundle Size

**Before:** 286.86 KB (gzipped: 81.86 KB)
**After:** 288.49 KB (gzipped: 82.22 KB)
**Change:** +1.63 KB (+0.36 KB gzipped)

Minimal increase due to:
- Purchase history types
- Renamed components
- Additional state management

### localStorage Size

**Before:** ~100 KB (everything persisted)
**After:** ~5-10 KB (only trolley + history)
**Improvement:** 90% reduction

### Load Time

- Faster initial load (less data to deserialize)
- Fresher data (no stale cache)
- Ready for real-time updates

---

## Security & Privacy

### Data Storage

- **localStorage** - Client-side only
- **No server communication** (yet)
- **No personal data** (beyond user names)

### Future Considerations

When adding real-time features:
- Encrypt localStorage
- Use secure API keys
- HTTPS only
- CORS configuration
- Rate limiting

---

## Testing Strategy

### Current Tests

```bash
# Functionality tests (38 tests)
npm run test:functionality  # 97.4% pass rate

# Component tests
npm run test                # Playwright E2E

# Build test
npm run build               # TypeScript compilation
```

### Test Coverage

- ✅ Product database
- ✅ Store coverage
- ✅ Price accuracy
- ✅ Category coverage
- ✅ Search functionality
- 🔜 Purchase history
- 🔜 Real-time pricing
- 🔜 AI agent tools

---

## Deployment

### Railway.app Configuration

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Environment Variables

Required:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Future (Phase 2):
```
VITE_OCADO_API_KEY=...
VITE_TESCO_API_KEY=...
# etc.
```

---

## Conclusion

Version 2.0 represents a significant architectural shift toward:

1. ✅ **Leaner state management** - Only persist what matters
2. ✅ **Better UK terminology** - "Trolley" not "Shopping List"
3. ✅ **Purchase history foundation** - Ready for AI learning
4. 🔜 **Real-time pricing** - Next sprint
5. 🔜 **Specialized agent** - Future enhancement

The architecture is now prepared for:
- Real-time price searches
- Smart pricing agent
- Purchase history learning
- Multi-store API integration
- Autonomous shopping features

**Next Steps:**
1. Integrate web search for live prices
2. Build purchase history UI
3. Start pricing agent development
4. Connect to real supermarket APIs

---

*Generated with Claude Code on 2025-10-21*
