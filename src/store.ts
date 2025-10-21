import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  ShoppingList,
  ShoppingItem,
  Challenge,
  MealPlan,
  AIMessage,
  Notification,
} from './types';

interface AppState {
  // Current user
  currentUser: User | null;
  users: User[];

  // Shopping
  shoppingList: ShoppingList;

  // Gamification
  challenges: Challenge[];

  // Meal Planning
  mealPlan: MealPlan | null;

  // AI Assistant
  aiMessages: AIMessage[];

  // Notifications
  notifications: Notification[];

  // Actions
  setCurrentUser: (user: User) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'votes'>) => void;
  removeShoppingItem: (itemId: string) => void;
  toggleItemPurchased: (itemId: string) => void;
  updateShoppingItem: (itemId: string, updates: Partial<ShoppingItem>) => void;
  voteOnItem: (itemId: string, userId: string, vote: 'approve' | 'reject' | 'neutral') => void;

  addPoints: (userId: string, points: number) => void;
  completeChallenge: (challengeId: string) => void;
  addBadge: (userId: string, badge: any) => void;

  setMealPlan: (mealPlan: MealPlan) => void;

  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;

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

const defaultShoppingList: ShoppingList = {
  id: 'list-1',
  items: [],
  lastUpdated: new Date(),
  totalEstimatedCost: 0,
  budgetRemaining: 1000, // Family budget £1000 total
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
      shoppingList: defaultShoppingList,
      challenges: defaultChallenges,
      mealPlan: null,
      aiMessages: [],
      notifications: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      addShoppingItem: (item) =>
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

          const newItem: ShoppingItem = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            addedAt: new Date(),
            votes: [],
          };

          const updatedItems = [...state.shoppingList.items, newItem];
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
            shoppingList: {
              ...state.shoppingList,
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

      removeShoppingItem: (itemId) =>
        set((state) => {
          const removedItem = state.shoppingList.items.find(item => item.id === itemId);
          const updatedItems = state.shoppingList.items.filter(
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
            shoppingList: {
              ...state.shoppingList,
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
          shoppingList: {
            ...state.shoppingList,
            items: state.shoppingList.items.map((item) =>
              item.id === itemId ? { ...item, purchased: !item.purchased } : item
            ),
            lastUpdated: new Date(),
          },
        })),

      updateShoppingItem: (itemId, updates) =>
        set((state) => {
          const updatedItems = state.shoppingList.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          );
          const totalEstimatedCost = updatedItems.reduce(
            (sum, item) => sum + (item.price || 0) * item.quantity,
            0
          );

          return {
            shoppingList: {
              ...state.shoppingList,
              items: updatedItems,
              lastUpdated: new Date(),
              totalEstimatedCost,
              budgetRemaining: 1400 - totalEstimatedCost,
            },
          };
        }),

      voteOnItem: (itemId, userId, vote) =>
        set((state) => ({
          shoppingList: {
            ...state.shoppingList,
            items: state.shoppingList.items.map((item) => {
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
    }
  )
);
