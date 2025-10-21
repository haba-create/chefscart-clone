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

// Initialize default users (parent1, parent2, teen)
const defaultUsers: User[] = [
  {
    id: 'user-1',
    name: 'Parent 1',
    role: 'parent1',
    monthlyBudget: 600,
    currentSpent: 0,
    points: 0,
    level: 1,
    badges: [],
    preferences: {
      favoriteStores: ['Tesco', 'Sainsburys'],
      dietaryRestrictions: [],
      notifications: true,
    },
  },
  {
    id: 'user-2',
    name: 'Parent 2',
    role: 'parent2',
    monthlyBudget: 600,
    currentSpent: 0,
    points: 0,
    level: 1,
    badges: [],
    preferences: {
      favoriteStores: ['Aldi', 'Lidl'],
      dietaryRestrictions: [],
      notifications: true,
    },
  },
  {
    id: 'user-3',
    name: 'Teen',
    role: 'teen',
    monthlyBudget: 200,
    currentSpent: 0,
    points: 0,
    level: 1,
    badges: [],
    preferences: {
      favoriteStores: ['Tesco'],
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
  budgetRemaining: 1400,
};

const defaultChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Budget Master',
    description: 'Stay within budget for the month',
    type: 'budget',
    points: 100,
    targetValue: 1400,
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

      removeShoppingItem: (itemId) =>
        set((state) => {
          const updatedItems = state.shoppingList.items.filter(
            (item) => item.id !== itemId
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
