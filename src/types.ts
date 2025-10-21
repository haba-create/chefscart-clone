// User and Profile Types
export type UserRole = 'parent1' | 'parent2' | 'teen';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  monthlyBudget: number;
  currentSpent: number;
  points: number;
  level: number;
  badges: Badge[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  favoriteStores: string[];
  dietaryRestrictions: string[];
  notifications: boolean;
}

// Shopping List Types
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  price?: number;
  store?: string;
  addedBy: string;
  addedAt: Date;
  purchased: boolean;
  notes?: string;
  votes: ItemVote[];
  urgency: 'low' | 'medium' | 'high';
}

export interface ItemVote {
  userId: string;
  vote: 'approve' | 'reject' | 'neutral';
}

export interface ShoppingList {
  id: string;
  items: ShoppingItem[];
  lastUpdated: Date;
  totalEstimatedCost: number;
  budgetRemaining: number;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'budget' | 'savings' | 'health' | 'variety';
  points: number;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
}

export interface Achievement {
  userId: string;
  points: number;
  level: number;
  streak: number;
  totalSavings: number;
}

// UK Supermarket Types
export interface SupermarketPrice {
  store: string;
  price: number;
  available: boolean;
  promotions?: string[];
  url?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  prices: SupermarketPrice[];
  nutrition?: NutritionInfo;
  imageUrl?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Meal Planning Types
export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  tags: string[];
  imageUrl?: string;
  estimatedCost: number;
  suitableForTeens: boolean;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export interface MealPlan {
  id: string;
  weekStartDate: Date;
  meals: PlannedMeal[];
  totalCost: number;
  shoppingListGenerated: boolean;
}

export interface PlannedMeal {
  id: string;
  recipeId: string;
  recipe: Recipe;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestedBy: string;
}

// AI Assistant Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: AIContext;
}

export interface AIContext {
  currentBudget?: number;
  shoppingList?: ShoppingItem[];
  recentPurchases?: ShoppingItem[];
  userPreferences?: UserPreferences;
}

export interface AIAssistantConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'deal' | 'budget' | 'achievement' | 'reminder' | 'vote';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Budget Types
export interface BudgetAlert {
  type: 'warning' | 'danger' | 'success';
  message: string;
  percentage: number;
}

export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Store Types
export type UKSupermarket =
  | 'Tesco'
  | 'Sainsburys'
  | 'Asda'
  | 'Morrisons'
  | 'Aldi'
  | 'Lidl'
  | 'Waitrose'
  | 'Iceland'
  | 'Ocado';

export interface Store {
  id: string;
  name: UKSupermarket;
  location: string;
  distance: number;
  deliveryAvailable: boolean;
  deliverySlots?: DeliverySlot[];
}

export interface DeliverySlot {
  id: string;
  date: Date;
  time: string;
  available: boolean;
  fee: number;
}
