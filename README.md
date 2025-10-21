# ChefsCart - AI-Powered Family Shopping App

An intelligent grocery shopping application designed for families in London, with special features to engage teenagers in monthly grocery planning. Built with React, TypeScript, Vite, and powered by Anthropic Claude AI.

**Version 2.0** - Major architectural refactoring with trolley-based design and purchase history tracking.

## Features

### For the Whole Family
- **Shopping Trolley**: Collaborative shopping cart where all family members can add items, vote, and comment (UK terminology)
- **AI-First Design**: 33/67 split-screen layout with AI Assistant always visible
- **Budget Tracking**: Family budget (£1000/month) with Zeth's £200 monthly add limit
- **UK Supermarket Focus**: Real UK stores - Ocado, Waitrose, Tesco, Sainsbury's, M&S
- **Purchase History**: Track what you've bought and learn from past purchases
- **Meal Planning**: Browse teen-friendly recipes and automatically generate trolley items
- **AI Shopping Assistant**: Powered by Anthropic Claude with Tools API for intelligent shopping

### Teen Engagement Features
- **Gamification**: Points, badges, levels, and challenges to make shopping fun
- **Family Participation**: Stephen (Dad), Cheslyn (Mum), Zeth (16-year-old son)
- **Budget Learning**: Zeth has £200 monthly limit to learn financial responsibility
- **Voting System**: Democratic decision-making on trolley items
- **Achievement System**: Unlock badges for good shopping habits
- **AI Companion**: Always available to answer questions and help with decisions

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude SDK
- **Icons**: Lucide React
- **Testing**: Playwright (E2E tests)

## Project Structure

```
chefscart-clone/
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Main app (33/67 split-screen layout)
│   ├── types.ts           # TypeScript type definitions
│   ├── store.ts           # Zustand state (persist trolley + history only)
│   ├── data/
│   │   └── groceries.ts   # UK grocery database (67 products)
│   └── index.css          # Global styles
├── components/
│   ├── Header.tsx         # App header with user info
│   ├── UserSwitcher.tsx   # Switch between family members
│   ├── Trolley.tsx        # Shopping trolley (renamed from ShoppingList)
│   ├── BudgetTracker.tsx  # Budget tracking and analytics
│   ├── Gamification.tsx   # Points, badges, challenges
│   ├── MealPlanner.tsx    # Meal planning and recipes
│   └── AIAssistant.tsx    # AI Assistant (33% left sidebar, always visible)
├── agents/
│   └── shoppingAssistant.ts  # Anthropic Claude agent with Tools API
├── docs/
│   ├── ARCHITECTURE.md    # Architecture documentation
│   ├── LAYOUT-DESIGN.md   # 33/67 split-screen layout details
│   ├── FUNCTIONALITY-INVENTORY.md  # Feature inventory
│   └── Claude.md          # AI assistant documentation
├── tests/
│   └── *.spec.ts          # Playwright E2E tests
├── tests/
│   ├── shopping-list.spec.ts
│   ├── user-switching.spec.ts
│   ├── gamification.spec.ts
│   ├── budget-tracking.spec.ts
│   ├── meal-planning.spec.ts
│   └── app-navigation.spec.ts
└── public/
    └── index.html
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Anthropic API key (get one at https://console.anthropic.com/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chefscart-clone
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers (for testing):
```bash
npx playwright install
```

### Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to http://localhost:3000

3. When using the AI Assistant feature, you'll need to enter your Anthropic API key in the settings (click the gear icon in the AI Assistant tab)

### Running Tests

Run all Playwright tests:
```bash
npm test
```

Run tests in UI mode (interactive):
```bash
npm run test:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

Debug tests:
```bash
npm run test:debug
```

View test report:
```bash
npm run test:report
```

## Usage Guide

### Family Members

The app supports three user profiles:
- **Parent 1**: £600 monthly budget
- **Parent 2**: £600 monthly budget
- **Teen (16)**: £200 monthly budget

Switch between users using the "Switch User" section on the home page.

### Shopping List

1. Click "Add Item to Shopping List"
2. Fill in item details (name, category, quantity, estimated price)
3. Vote on items added by other family members
4. Mark items as purchased when shopping
5. Earn 5 points for adding items, 10 points for purchasing

### Budget Tracking

- Monitor individual and family budgets
- See spending by category
- Get alerts when approaching budget limits
- View UK supermarket savings tips
- Track estimated vs actual spending

### Gamification

- Earn points for shopping activities
- Complete challenges to unlock badges
- Compete on the family leaderboard
- Level up as you earn more points
- View how to earn points guide

### Meal Planning

- Browse 5 teen-approved recipes
- View nutrition information and cooking instructions
- Add recipe ingredients to shopping list automatically
- Plan meals for the week
- Get meal planning tips

### AI Assistant

1. Navigate to the AI Assistant tab
2. Click settings (gear icon) to enter your Anthropic API key
3. Use quick actions for:
   - Smart shopping suggestions
   - Budget analysis
   - Teen-friendly meal ideas
4. Or chat freely for personalized advice

## Testing

The app includes comprehensive E2E tests covering:

- **Shopping List** (13 tests): Adding items, voting, purchasing, budget calculations
- **User Switching** (11 tests): Profile management, budget display, persistence
- **Gamification** (17 tests): Points, badges, challenges, leaderboard
- **Budget Tracking** (17 tests): Budget monitoring, alerts, category spending
- **Meal Planning** (19 tests): Recipe browsing, ingredients, nutrition
- **App Navigation** (19 tests): Tab switching, responsiveness, state management

**Total: 96 comprehensive E2E tests**

## Key Features Explained

### Anthropic AI Integration

The app uses Anthropic's Claude API through a custom `ShoppingAssistantAgent` class that provides:

- Context-aware shopping suggestions
- Budget optimization advice
- Meal planning for teens
- Price comparison insights for UK supermarkets
- Natural language conversation

### State Management

Uses Zustand with localStorage persistence:
- All data persists across page reloads
- Real-time updates across components
- No external database required (perfect for demo)

### Teen Engagement Strategy

1. **Points System**: Immediate feedback for actions
2. **Visual Progress**: Progress bars and level indicators
3. **Competition**: Family leaderboard creates friendly rivalry
4. **Autonomy**: Personal budget teaches responsibility
5. **Achievement**: Badges provide long-term goals

## Environment Variables

### Local Development

Create a `.env.local` file (optional):

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Or enter it directly in the AI Assistant settings panel.

### Railway.app Deployment

When deploying to Railway:

1. Go to your Railway project settings
2. Navigate to the "Variables" tab
3. Add the following environment variable:
   - **Key**: `VITE_ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key (get it from https://console.anthropic.com/)
4. Redeploy the application

The app will automatically use the environment variable if it's set, otherwise users can enter the API key manually in the AI Assistant settings panel.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

## Deploying to Railway.app

1. **Connect your repository** to Railway
2. **Configure build settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` (or use a static server like `npx serve dist`)
3. **Add environment variables**:
   - Go to Variables tab
   - Add `VITE_ANTHROPIC_API_KEY` with your Anthropic API key
4. **Deploy**!

Railway will automatically:
- Install dependencies
- Build the TypeScript + React app
- Serve the production build

**Important**: Make sure to set `VITE_ANTHROPIC_API_KEY` in Railway's environment variables for the AI Assistant to work out of the box.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Commit and push
6. Create a pull request

## License

This project is for educational purposes.

## Credits

- Built with React, TypeScript, and Vite
- AI powered by Anthropic Claude
- Icons from Lucide React
- Styled with Tailwind CSS

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Include browser console errors if applicable

---

**Made for London families who want to make grocery shopping fun, educational, and collaborative!**
