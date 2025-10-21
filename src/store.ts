import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Trolley,
  TrolleyItem,
  PurchaseHistory,
  PurchasedItem,
  Challenge,
  MealPlan,
  AIMessage,
  Notification,
} from './types';

interface AppState {
  // Current user
  currentUser: User | null;
  users: User[];

  // Trolley (Shopping Cart) - PERSISTED
  trolley: Trolley;

  // Purchase History - PERSISTED
  purchaseHistory: PurchaseHistory;

  // Gamification
  challenges: Challenge[];

  // Meal Planning
  mealPlan: MealPlan | null;

  // AI Assistant (not persisted - fresh on each session)
  aiMessages: AIMessage[];

  // Notifications
  notifications: Notification[];

  // Trolley Actions
  setCurrentUser: (user: User) => void;
  addTrolleyItem: (item: Omit<TrolleyItem, 'id' | 'addedAt' | 'votes'>) => void;
  removeTrolleyItem: (itemId: string) => void;
  toggleItemPurchased: (itemId: string) => void;
  updateTrolleyItem: (itemId: string, updates: Partial<TrolleyItem>) => void;
  voteOnItem: (itemId: string, userId: string, vote: 'approve' | 'reject' | 'neutral') => void;

  // Purchase History Actions
  moveTrolleyItemToPurchaseHistory: (itemId: string) => void;
  addToPurchaseHistory: (item: Omit<PurchasedItem, 'id'>) => void;
  clearPurchaseHistory: () => void;

  // Gamification Actions
  addPoints: (userId: string, points: number) => void;
  completeChallenge: (challengeId: string) => void;
  addBadge: (userId: string, badge: any) => void;

  // Meal Planning Actions
  setMealPlan: (mealPlan: MealPlan) => void;

  // AI Assistant Actions
  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;

  // Budget Actions
  updateUserBudget: (userId: string, amount: number) => void;
}

// Initialize default users - Stephen, Cheslyn (Chez), and Zeth
// Family budget: £1000 total for everything
// Zeth can only add up to £200 worth of items per month
const defaultUsers: User[] = [
  {
    id: 'user-1',
    name: 'Stephen',
    role: 'parent1',
    monthlyBudget: 1000, // Full family budget
    currentSpent: 0,
    monthlyAddedValue: 0, // No limit for parents
    points: 0,
    level: 1,
    badges: [],
    preferences: {
      favoriteStores: ['Tesco', 'Sainsburys', 'M&S', 'Waitrose'],
      dietaryRestrictions: [],
      notifications: true,
    },
  },
  {
    id: 'user-2',
    name: 'Cheslyn',
    role: 'parent2',
    monthlyBudget: 1000, // Full family budget
    currentSpent: 0,
    monthlyAddedValue: 0, // No limit for parents
    points: 0,
    level: 1,
    badges: [],
    preferences: {
      favoriteStores: ['Tesco', 'Sainsburys', 'M&S', 'Waitrose'],
      dietaryRestrictions: [],
      notifications: true,
    },
  },
  {
    id: 'user-3',
    name: 'Zeth',
    role: 'teen',
    monthlyBudget: 1000, // Full family budget
    currentSpent: 0,
    monthlyAddedValue: 0, // Track to enforce £200 monthly limit
    points: 0,
    level: 1,
    badges: [],
    preferences: {
      favoriteStores: ['Tesco', 'Sainsburys', 'M&S', 'Waitrose'],
      dietaryRestrictions: [],
      notifications: true,
    },
  },
];

const defaultTrolley: Trolley = {
  id: 'trolley-1',
  items: [],
  lastUpdated: new Date(),
  totalEstimatedCost: 0,
  budgetRemaining: 1000, // Family budget £1000 total
};

const defaultPurchaseHistory: PurchaseHistory = {
  id: 'history-1',
  purchases: [],
  lastUpdated: new Date(),
  totalSpent: 0,
};

const defaultChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Budget Master',
    description: 'Stay within budget for the month',
    type: 'budget',
    points: 100,
    targetValue: 1000, // Family budget £1000
    currentValue: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completed: false,
  },
  {
    id: 'challenge-2',
    title: 'Deal Hunter',
    description: 'Save £50 with deals and price comparisons',
    type: 'savings',
    points: 75,
    targetValue: 50,
    currentValue: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completed: false,
  },
  {
    id: 'challenge-3',
    title: 'Healthy Choices',
    description: 'Add 20 healthy items to the shopping list',
    type: 'health',
    points: 50,
    targetValue: 20,
    currentValue: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    completed: false,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: defaultUsers[2], // Start with teen user
      users: defaultUsers,
      trolley: defaultTrolley,
      purchaseHistory: defaultPurchaseHistory,
      challenges: defaultChallenges,
      mealPlan: null,
      aiMessages: [],
      notifications: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      addTrolleyItem: (item) =>
        set((state) => {
          // Check if user is Zeth and enforce £200 monthly limit
          const currentUser = state.currentUser;
          const itemValue = (item.price || 0) * item.quantity;

          if (currentUser && currentUser.role === 'teen') {
            const newMonthlyTotal = currentUser.monthlyAddedValue + itemValue;
            if (newMonthlyTotal > 200) {
              // Alert user that they've exceeded their £200 limit
              alert(`Zeth's monthly limit: You can only add £${(200 - currentUser.monthlyAddedValue).toFixed(2)} more this month (£200 limit)`);
              return state; // Don't add the item
            }
          }

          const newItem: TrolleyItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            addedAt: new Date(),
            votes: [],
          };

          const updatedItems = [...state.trolley.items, newItem];
          const totalEstimatedCost = updatedItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          );

          // Update user's monthly added value if Zeth
          const updatedUsers = currentUser && currentUser.role === 'teen'
            ? state.users.map(u =>
                u.id === currentUser.id
                  ? { ...u, monthlyAddedValue: u.monthlyAddedValue + itemValue }
                  : u
              )
            : state.users;

          return {
            trolley: {
              ...state.trolley,
              items: updatedItems,
              lastUpdated: new Date(),
              totalEstimatedCost,
              budgetRemaining: 1000 - totalEstimatedCost,
            },
            users: updatedUsers,
            currentUser: currentUser && currentUser.role === 'teen'
              ? { ...currentUser, monthlyAddedValue: currentUser.monthlyAddedValue + itemValue }
              : currentUser,
          };
        }),

      removeTrolleyItem: (itemId) =>
        set((state) => {
          const removedItem = state.trolley.items.find(item => item.id === itemId);
          const updatedItems = state.trolley.items.filter(
            (item) => item.id !== itemId
          );
          const totalEstimatedCost = updatedItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          );

          // If removed item was added by Zeth, decrease their monthlyAddedValue
          const currentUser = state.currentUser;
          const removedValue = removedItem ? (removedItem.price || 0) * removedItem.quantity : 0;
          const isZethItem = removedItem && currentUser &&
                             removedItem.addedBy === currentUser.id &&
                             currentUser.role === 'teen';

          const updatedUsers = isZethItem
            ? state.users.map(u =>
                u.id === currentUser.id
                  ? { ...u, monthlyAddedValue: Math.max(0, u.monthlyAddedValue - removedValue) }
                  : u
              )
            : state.users;

          return {
            trolley: {
              ...state.trolley,
              items: updatedItems,
              lastUpdated: new Date(),
              totalEstimatedCost,
              budgetRemaining: 1000 - totalEstimatedCost,
            },
            users: updatedUsers,
            currentUser: isZethItem && currentUser
              ? { ...currentUser, monthlyAddedValue: Math.max(0, currentUser.monthlyAddedValue - removedValue) }
              : currentUser,
          };
        }),

      toggleItemPurchased: (itemId) =>
        set((state) => ({
          trolley: {
            ...state.trolley,
            items: state.trolley.items.map((item) =>
              item.id === itemId ? { ...item, purchased: !item.purchased } : item
            ),
            lastUpdated: new Date(),
          },
        })),

      updateTrolleyItem: (itemId, updates) =>
        set((state) => {
          const updatedItems = state.trolley.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          );
          const totalEstimatedCost = updatedItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          );

          return {
            trolley: {
              ...state.trolley,
              items: updatedItems,
              lastUpdated: new Date(),
              totalEstimatedCost,
              budgetRemaining: 1000 - totalEstimatedCost,
            },
          };
        }),

      voteOnItem: (itemId, userId, vote) =>
        set((state) => ({
          trolley: {
            ...state.trolley,
            items: state.trolley.items.map((item) => {
              if (item.id !== itemId) return item;

              const existingVoteIndex = item.votes.findIndex(
                (v) => v.userId === userId
              );
              const newVotes = [...item.votes];

              if (existingVoteIndex >= 0) {
                newVotes[existingVoteIndex] = { userId, vote };
              } else {
                newVotes.push({ userId, vote });
              }

              return { ...item, votes: newVotes };
            }),
            lastUpdated: new Date(),
          },
        })),

      // Purchase History Actions
      moveTrolleyItemToPurchaseHistory: (itemId) =>
        set((state) => {
          const item = state.trolley.items.find(i => i.id === itemId);
          if (!item || !item.purchased || !item.price || !item.store) return state;

          const currentUser = state.currentUser;
          if (!currentUser) return state;

          const purchasedItem: PurchasedItem = {
            id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category,
            price: item.price,
            store: item.store,
            purchasedBy: currentUser.id,
            purchasedAt: new Date(),
            addedBy: item.addedBy,
            notes: item.notes,
          };

          const updatedPurchases = [...state.purchaseHistory.purchases, purchasedItem];
          const totalSpent = updatedPurchases.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          );

          // Remove from trolley
          const updatedTrolleyItems = state.trolley.items.filter(i => i.id !== itemId);
          const totalEstimatedCost = updatedTrolleyItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          );

          return {
            purchaseHistory: {
              ...state.purchaseHistory,
              purchases: updatedPurchases,
              lastUpdated: new Date(),
              totalSpent,
            },
            trolley: {
              ...state.trolley,
              items: updatedTrolleyItems,
              lastUpdated: new Date(),
              totalEstimatedCost,
              budgetRemaining: 1000 - totalEstimatedCost,
            },
          };
        }),

      addToPurchaseHistory: (item) =>
        set((state) => {
          const purchasedItem: PurchasedItem = {
            ...item,
            id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          const updatedPurchases = [...state.purchaseHistory.purchases, purchasedItem];
          const totalSpent = updatedPurchases.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          );

          return {
            purchaseHistory: {
              ...state.purchaseHistory,
              purchases: updatedPurchases,
              lastUpdated: new Date(),
              totalSpent,
            },
          };
        }),

      clearPurchaseHistory: () =>
        set({
          purchaseHistory: defaultPurchaseHistory,
        }),

      addPoints: (userId, points) =>
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id !== userId) return user;

            const newPoints = user.points + points;
            const newLevel = Math.floor(newPoints / 100) + 1;

            return {
              ...user,
              points: newPoints,
              level: newLevel,
            };
          }),
        })),

      completeChallenge: (challengeId) =>
        set((state) => {
          const challenge = state.challenges.find((c) => c.id === challengeId);
          if (!challenge || challenge.completed) return state;

          const updatedChallenges = state.challenges.map((c) =>
            c.id === challengeId ? { ...c, completed: true } : c
          );

          // Award points to current user
          const currentUser = state.currentUser;
          if (currentUser) {
            get().addPoints(currentUser.id, challenge.points);
          }

          return { challenges: updatedChallenges };
        }),

      addBadge: (userId, badge) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? { ...user, badges: [...user.badges, badge] }
              : user
          ),
        })),

      setMealPlan: (mealPlan) => set({ mealPlan }),

      addAIMessage: (message) =>
        set((state) => ({
          aiMessages: [...state.aiMessages, message],
        })),

      clearAIMessages: () => set({ aiMessages: [] }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date(),
              read: false,
            },
          ],
        })),

      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        })),

      updateUserBudget: (userId, amount) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? { ...user, currentSpent: user.currentSpent + amount }
              : user
          ),
        })),
    }),
    {
      name: 'chefscart-storage',
      // Only persist trolley and purchase history
      // Everything else (users, challenges, AI messages, etc.) will reset on refresh
      partialize: (state) => ({
        trolley: state.trolley,
        purchaseHistory: state.purchaseHistory,
      }),
    }
  )
);
