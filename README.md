# ChefsCart - AI-Powered Family Shopping App

An intelligent grocery shopping application designed for families in London, with special features to engage teenagers in monthly grocery planning. Built with React, TypeScript, Vite, and powered by Anthropic Claude AI.

## Features

### For the Whole Family
- **Shared Shopping List**: Collaborative shopping list where all family members can add items, vote, and comment
- **Budget Tracking**: Individual and family-wide budget monitoring with real-time updates
- **UK Supermarket Focus**: Tailored for London families with tips for Tesco, Sainsbury's, Asda, Morrisons, Aldi, and Lidl
- **Meal Planning**: Browse teen-friendly recipes and automatically generate shopping lists
- **AI Shopping Assistant**: Powered by Anthropic Claude for smart suggestions, budget analysis, and meal ideas

### Teen Engagement Features
- **Gamification**: Points, badges, levels, and challenges to make shopping fun
- **Family Leaderboard**: Friendly competition to encourage participation
- **Budget Learning**: Teach financial responsibility with personal budget allocations
- **Voting System**: Democratic decision-making on shopping items
- **Achievement System**: Unlock badges for good shopping habits

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
│   ├── App.tsx            # Main app component
│   ├── types.ts           # TypeScript type definitions
│   ├── store.ts           # Zustand state management
│   └── index.css          # Global styles
├── components/
│   ├── Header.tsx         # App header with user info
│   ├── UserSwitcher.tsx   # Switch between family members
│   ├── ShoppingList.tsx   # Shopping list management
│   ├── BudgetTracker.tsx  # Budget tracking and analytics
│   ├── Gamification.tsx   # Points, badges, challenges
│   ├── MealPlanner.tsx    # Meal planning and recipes
│   └── AIAssistant.tsx    # AI-powered shopping assistant
├── agents/
│   └── shoppingAssistant.ts  # Anthropic AI agent logic
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

Create a `.env.local` file (optional):

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Or enter it directly in the AI Assistant settings panel.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

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
