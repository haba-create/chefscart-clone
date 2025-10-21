/**
 * Shopping Assistant AI Tests
 *
 * Tests for AI-First Shopping Assistant with Tools API
 * Covers: Budget calculations, supermarket search, list analysis, item suggestions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createShoppingAssistant, ShoppingAssistantAgent } from '../agents/shoppingAssistant';
import type { User, ShoppingItem } from '../src/types';

// Mock Anthropic client
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  };
});

describe('ShoppingAssistantAgent', () => {
  let assistant: ShoppingAssistantAgent;
  let mockUser: User;
  let mockShoppingList: ShoppingItem[];

  beforeEach(() => {
    assistant = createShoppingAssistant('test-api-key');

    mockUser = {
      id: 'user-1',
      name: 'Stephen',
      role: 'parent1',
      monthlyBudget: 1000,
      currentSpent: 300,
      monthlyAddedValue: 0,
      points: 100,
      level: 2,
      badges: [],
      preferences: {
        dietaryRestrictions: [],
        favoriteStores: ['Tesco', 'Sainsburys'],
        allergies: [],
      },
    };

    mockShoppingList = [
      {
        id: 'item-1',
        name: 'Milk',
        quantity: 2,
        unit: 'liters',
        category: 'Dairy',
        price: 1.45,
        store: 'Tesco',
        addedBy: 'user-1',
        votes: [],
        createdAt: new Date(),
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
        votes: [],
        createdAt: new Date(),
      },
    ];
  });

  describe('Constructor', () => {
    it('should create assistant with valid API key', () => {
      expect(assistant).toBeDefined();
      expect(assistant).toBeInstanceOf(ShoppingAssistantAgent);
    });

    it('should throw error with empty API key', () => {
      expect(() => createShoppingAssistant('')).toThrow('Anthropic API key is required');
    });

    it('should throw error with undefined API key', () => {
      expect(() => createShoppingAssistant('undefined')).toThrow('Anthropic API key is required');
    });
  });

  describe('setContext', () => {
    it('should set shopping context successfully', () => {
      const context = {
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      };

      expect(() => assistant.setContext(context)).not.toThrow();
    });

    it('should update context when called multiple times', () => {
      const context1 = {
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      };

      const context2 = {
        ...context1,
        budget: 600,
      };

      assistant.setContext(context1);
      assistant.setContext(context2);

      // Context should be updated (tested via chat which requires context)
      expect(() => assistant.setContext(context2)).not.toThrow();
    });
  });

  describe('chat', () => {
    beforeEach(() => {
      assistant.setContext({
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      });
    });

    it('should throw error if context not set', async () => {
      const freshAssistant = createShoppingAssistant('test-key');

      await expect(
        freshAssistant.chat('Hello')
      ).rejects.toThrow('Shopping context not set');
    });

    it('should use correct model (claude-sonnet-4-5-20250929)', async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Hello!' }],
        stop_reason: 'end_turn',
      });

      // @ts-ignore - accessing private client for testing
      assistant.client.messages.create = mockCreate;

      await assistant.chat('Hello');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-5-20250929',
        })
      );
    });

    it('should handle tool execution loop', async () => {
      const mockCreate = vi.fn()
        // First response with tool use
        .mockResolvedValueOnce({
          content: [
            {
              type: 'tool_use',
              id: 'tool-1',
              name: 'calculate_budget',
              input: {
                operation: 'Calculate remaining',
                values: { total: 1000, spent: 300 },
              },
            },
          ],
          stop_reason: 'tool_use',
        })
        // Second response after tool execution
        .mockResolvedValueOnce({
          content: [
            {
              type: 'text',
              text: 'You have £700 remaining in your budget.',
            },
          ],
          stop_reason: 'end_turn',
        });

      // @ts-ignore
      assistant.client.messages.create = mockCreate;

      const response = await assistant.chat('How much budget do I have left?');

      expect(response).toContain('700');
      expect(mockCreate).toHaveBeenCalledTimes(2); // Tool use + final response
    });

    it('should handle API errors gracefully', async () => {
      const mockCreate = vi.fn().mockRejectedValue({
        status: 401,
        message: 'Invalid API key',
      });

      // @ts-ignore
      assistant.client.messages.create = mockCreate;

      const response = await assistant.chat('Hello');

      expect(response).toContain('Authentication Error');
      expect(response).toContain('Invalid API key');
    });

    it('should handle rate limit errors', async () => {
      const mockCreate = vi.fn().mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded',
      });

      // @ts-ignore
      assistant.client.messages.create = mockCreate;

      const response = await assistant.chat('Hello');

      expect(response).toContain('Rate Limit');
    });
  });

  describe('Budget Calculation Tool', () => {
    it('should calculate remaining budget', () => {
      const result = (assistant as any).calculateBudget({
        operation: 'Calculate remaining',
        values: { total: 1000, spent: 300 },
      });

      expect(result.calculations.remaining).toBe(700);
      expect(result.calculations.percentageUsed).toBe('30.00');
      expect(result.calculations.percentageRemaining).toBe('70.00');
    });

    it('should calculate average cost per item', () => {
      const result = (assistant as any).calculateBudget({
        operation: 'Average per item',
        values: { total: 100, items: 10 },
      });

      expect(result.calculations.averageCostPerItem).toBe('10.00');
    });

    it('should project monthly spending', () => {
      const result = (assistant as any).calculateBudget({
        operation: 'Project monthly',
        values: { currentSpending: 150, daysInMonth: 10 },
      });

      expect(result.calculations.dailyAverage).toBe('15.00');
      expect(result.calculations.projectedMonthly).toBe('450.00');
    });

    it('should handle errors gracefully', () => {
      const result = (assistant as any).calculateBudget({
        operation: 'Invalid operation',
        values: null, // Invalid input
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('Supermarket Search Tool', () => {
    it('should search for milk prices across stores', () => {
      const result = (assistant as any).searchSupermarkets({
        item: 'milk',
        stores: ['Tesco', 'Sainsburys', 'Waitrose', 'M&S'],
      });

      expect(result.item).toBe('milk');
      expect(result.stores_searched).toEqual(['Tesco', 'Sainsburys', 'Waitrose', 'M&S']);
      expect(result.prices.Tesco).toBeDefined();
      expect(result.prices.Tesco.price).toBe(1.45);
      expect(result.recommendation).toContain('Best price');
    });

    it('should search for bread prices', () => {
      const result = (assistant as any).searchSupermarkets({
        item: 'bread',
      });

      expect(result.prices.Tesco.price).toBe(0.95);
      expect(result.prices['M&S'].price).toBe(1.30);
    });

    it('should filter by max price', () => {
      const result = (assistant as any).searchSupermarkets({
        item: 'milk',
        max_price: 1.50,
      });

      expect(result.within_budget).toBeDefined();
      const budgetStores = result.within_budget.map(([store]: any) => store);
      expect(budgetStores).toContain('Tesco'); // £1.45
      expect(budgetStores).not.toContain('M&S'); // £1.75
    });

    it('should provide estimates for unknown items', () => {
      const result = (assistant as any).searchSupermarkets({
        item: 'exotic fruit',
      });

      expect(result.note).toContain('estimates');
      expect(result.prices.Tesco.price).toBe('Budget-friendly');
    });

    it('should default to all stores if not specified', () => {
      const result = (assistant as any).searchSupermarkets({
        item: 'eggs',
      });

      expect(result.stores_searched).toEqual(['M&S', 'Waitrose', 'Tesco', 'Sainsburys']);
    });
  });

  describe('Shopping List Analysis Tool', () => {
    beforeEach(() => {
      assistant.setContext({
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      });
    });

    it('should analyze budget impact', () => {
      const result = (assistant as any).analyzeShoppingList({
        focus: 'budget',
      });

      expect(result.focus).toBe('budget');
      expect(result.itemCount).toBe(2);
      expect(result.totalCost).toBe('3.85'); // 2.90 + 0.95
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should analyze health aspects', () => {
      const result = (assistant as any).analyzeShoppingList({
        focus: 'health',
      });

      expect(result.focus).toBe('health');
      expect(result.categories).toBeDefined();
      expect(result.categories.Dairy).toBe(1);
      expect(result.categories.Bakery).toBe(1);
    });

    it('should check for completeness', () => {
      const result = (assistant as any).analyzeShoppingList({
        focus: 'completeness',
      });

      expect(result.focus).toBe('completeness');
      expect(result.hasEssentials).toContain('Milk');
      expect(result.hasEssentials).toContain('Bread');
      expect(result.missingEssentials).toBeDefined();
    });

    it('should warn if budget exceeded', () => {
      // Create expensive shopping list
      const expensiveList: ShoppingItem[] = [
        {
          id: 'item-expensive',
          name: 'Premium Steak',
          quantity: 10,
          unit: 'kg',
          category: 'Meat',
          price: 100,
          store: 'M&S',
          addedBy: 'user-1',
          votes: [],
          createdAt: new Date(),
        },
      ];

      assistant.setContext({
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: expensiveList,
        budget: 700,
      });

      const result = (assistant as any).analyzeShoppingList({
        focus: 'budget',
      });

      expect(result.insights.some((i: string) => i.includes('exceeds'))).toBe(true);
    });

    it('should return error if no context', () => {
      const freshAssistant = createShoppingAssistant('test-key');
      const result = (freshAssistant as any).analyzeShoppingList({
        focus: 'budget',
      });

      expect(result.error).toBe('No shopping context available');
    });
  });

  describe('Item Suggestions Tool', () => {
    it('should suggest essentials', () => {
      const result = (assistant as any).suggestItems({
        category: 'essentials',
        count: 3,
      });

      expect(result.category).toBe('essentials');
      expect(result.items.length).toBe(3);
      expect(result.items[0].name).toBeDefined();
      expect(result.items[0].estimatedPrice).toBeGreaterThan(0);
      expect(result.items[0].reason).toBeDefined();
      expect(result.estimatedTotal).toBeDefined();
    });

    it('should suggest healthy snacks', () => {
      const result = (assistant as any).suggestItems({
        category: 'healthy snacks',
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.some((i: any) => i.reason.includes('Healthy'))).toBe(true);
    });

    it('should suggest meal ingredients', () => {
      const result = (assistant as any).suggestItems({
        category: 'meal ingredients',
        count: 5,
      });

      expect(result.items.length).toBe(5);
    });

    it('should default to essentials for unknown category', () => {
      const result = (assistant as any).suggestItems({
        category: 'unknown category',
      });

      expect(result.items.length).toBeGreaterThan(0);
      // Should fall back to essentials
    });

    it('should calculate estimated total correctly', () => {
      const result = (assistant as any).suggestItems({
        category: 'essentials',
        count: 2,
      });

      const manualTotal = result.items.reduce(
        (sum: number, item: any) => sum + item.estimatedPrice,
        0
      );

      expect(parseFloat(result.estimatedTotal)).toBeCloseTo(manualTotal, 2);
    });
  });

  describe('Tool Execution', () => {
    beforeEach(() => {
      assistant.setContext({
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      });
    });

    it('should execute calculate_budget tool', async () => {
      const result = await (assistant as any).executeTool('calculate_budget', {
        operation: 'test',
        values: { total: 1000, spent: 300 },
      });

      expect(result.calculations).toBeDefined();
    });

    it('should execute search_uk_supermarkets tool', async () => {
      const result = await (assistant as any).executeTool('search_uk_supermarkets', {
        item: 'milk',
      });

      expect(result.prices).toBeDefined();
    });

    it('should execute analyze_shopping_list tool', async () => {
      const result = await (assistant as any).executeTool('analyze_shopping_list', {
        focus: 'budget',
      });

      expect(result.insights).toBeDefined();
    });

    it('should execute suggest_items tool', async () => {
      const result = await (assistant as any).executeTool('suggest_items', {
        category: 'essentials',
      });

      expect(result.items).toBeDefined();
    });

    it('should return error for unknown tool', async () => {
      const result = await (assistant as any).executeTool('unknown_tool', {});

      expect(result.error).toContain('Unknown tool');
    });
  });

  describe('System Prompt', () => {
    it('should build system prompt with context', () => {
      assistant.setContext({
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      });

      const prompt = (assistant as any).buildSystemPrompt();

      expect(prompt).toContain('Stephen');
      expect(prompt).toContain('£1000');
      expect(prompt).toContain('Remaining: £700');
      expect(prompt).toContain('M&S');
      expect(prompt).toContain('Waitrose');
      expect(prompt).toContain('Tesco');
      expect(prompt).toContain("Sainsbury's");
    });

    it('should include Zeth\'s monthly limit for teens', () => {
      const teenUser: User = {
        ...mockUser,
        id: 'user-3',
        name: 'Zeth',
        role: 'teen',
        monthlyAddedValue: 150,
      };

      assistant.setContext({
        currentUser: teenUser,
        users: [mockUser, teenUser],
        shoppingList: mockShoppingList,
        budget: 700,
      });

      const prompt = (assistant as any).buildSystemPrompt();

      expect(prompt).toContain('Zeth');
      expect(prompt).toContain('£150');
      expect(prompt).toContain('£200');
    });

    it('should show shopping list cost in prompt', () => {
      assistant.setContext({
        currentUser: mockUser,
        users: [mockUser],
        shoppingList: mockShoppingList,
        budget: 700,
      });

      const prompt = (assistant as any).buildSystemPrompt();

      // Milk: 2 * 1.45 = 2.90, Bread: 1 * 0.95 = 0.95, Total: 3.85
      expect(prompt).toContain('£3.85');
    });

    it('should return default prompt if no context', () => {
      const freshAssistant = createShoppingAssistant('test-key');
      const prompt = (freshAssistant as any).buildSystemPrompt();

      expect(prompt).toBe('You are a helpful AI shopping assistant.');
    });
  });

  describe('Clear History', () => {
    it('should have clearHistory method for API compatibility', () => {
      expect(assistant.clearHistory).toBeDefined();
      expect(() => assistant.clearHistory()).not.toThrow();
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complete user workflow', async () => {
    const assistant = createShoppingAssistant('test-key');

    const mockUser: User = {
      id: 'user-1',
      name: 'Stephen',
      role: 'parent1',
      monthlyBudget: 1000,
      currentSpent: 300,
      monthlyAddedValue: 0,
      points: 100,
      level: 2,
      badges: [],
      preferences: {
        dietaryRestrictions: [],
        favoriteStores: ['Tesco'],
        allergies: [],
      },
    };

    // Set context
    assistant.setContext({
      currentUser: mockUser,
      users: [mockUser],
      shoppingList: [],
      budget: 700,
    });

    // Mock successful API call
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Here are some suggestions...' }],
      stop_reason: 'end_turn',
    });

    // @ts-ignore
    assistant.client.messages.create = mockCreate;

    // User asks for suggestions
    const response = await assistant.chat('What should I buy this week?');

    expect(response).toBeDefined();
    expect(mockCreate).toHaveBeenCalled();
  });
});
