import Anthropic from '@anthropic-ai/sdk';
import type { ShoppingItem, User } from '../src/types';

/**
 * AI-First Shopping Assistant using Anthropic Claude with Tools
 *
 * Capabilities:
 * - Budget calculations and analysis
 * - UK supermarket price comparisons
 * - Shopping list optimization
 * - Consumption pattern analysis
 * - Intelligent recommendations
 */

interface ShoppingContext {
  currentUser: User;
  users: User[];
  shoppingList: ShoppingItem[];
  budget: number;
}

// Define tools for the AI agent
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'calculate_budget',
    description: 'Perform budget calculations, analyze spending patterns, predict future costs, and provide financial insights for grocery shopping. Can handle arithmetic, percentages, projections, and comparisons.',
    input_schema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'The calculation or analysis to perform (e.g., "Calculate total cost", "Find percentage of budget used", "Project monthly spending")',
        },
        values: {
          type: 'object',
          description: 'Key-value pairs of numbers needed for the calculation',
          additionalProperties: { type: 'number' },
        },
      },
      required: ['operation', 'values'],
    },
  },
  {
    name: 'search_uk_supermarkets',
    description: 'Search and compare prices for grocery items across UK supermarkets (M&S, Waitrose, Tesco, Sainsburys). Provides typical price ranges, deals, and recommendations.',
    input_schema: {
      type: 'object',
      properties: {
        item: {
          type: 'string',
          description: 'The grocery item to search for (e.g., "milk", "bread", "chicken breast")',
        },
        stores: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of stores to compare (defaults to all: M&S, Waitrose, Tesco, Sainsburys)',
        },
        max_price: {
          type: 'number',
          description: 'Maximum price budget for this item',
        },
      },
      required: ['item'],
    },
  },
  {
    name: 'analyze_shopping_list',
    description: 'Analyze the current shopping list for optimization opportunities, budget impact, health considerations, and missing essentials.',
    input_schema: {
      type: 'object',
      properties: {
        focus: {
          type: 'string',
          enum: ['budget', 'health', 'completeness', 'optimization'],
          description: 'What aspect to focus the analysis on',
        },
      },
      required: ['focus'],
    },
  },
  {
    name: 'suggest_items',
    description: 'Suggest items to add to the shopping list based on current list, family patterns, budget, and nutritional needs.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Category of suggestions (e.g., "essentials", "healthy snacks", "meal ingredients")',
        },
        count: {
          type: 'number',
          description: 'Number of suggestions to provide',
        },
      },
      required: ['category'],
    },
  },
];

export class ShoppingAssistantAgent {
  private client: Anthropic;
  private context: ShoppingContext | null = null;

  constructor(apiKey: string) {
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      throw new Error('Anthropic API key is required. Please set VITE_ANTHROPIC_API_KEY in your environment variables.');
    }

    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }

  /**
   * Set the shopping context for the AI
   */
  setContext(context: ShoppingContext): void {
    this.context = context;
  }

  /**
   * Clear conversation history (if needed in the future)
   */
  clearHistory(): void {
    // Currently stateless - each chat() call is independent
    // This method is here for API compatibility
    console.log('History cleared (stateless agent)');
  }

  /**
   * Main chat interface with tool support
   */
  async chat(userMessage: string): Promise<string> {
    if (!this.context) {
      throw new Error('Shopping context not set. Call setContext() first.');
    }

    const systemPrompt = this.buildSystemPrompt();

    try {
      let messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // Initial API call
      let response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        tools: TOOLS,
      });

      // Handle tool calls
      while (response.stop_reason === 'tool_use') {
        const toolUse = response.content.find(
          (block) => block.type === 'tool_use'
        ) as Anthropic.ToolUseBlock | undefined;

        if (!toolUse) break;

        // Execute the tool
        const toolResult = await this.executeTool(toolUse.name, toolUse.input);

        // Add assistant response and tool result to messages
        messages = [
          ...messages,
          {
            role: 'assistant',
            content: response.content,
          },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify(toolResult),
              },
            ],
          },
        ];

        // Continue the conversation
        response = await this.client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: systemPrompt,
          messages,
          tools: TOOLS,
        });
      }

      // Extract final text response
      const textBlock = response.content.find(
        (block) => block.type === 'text'
      ) as Anthropic.TextBlock | undefined;

      return textBlock?.text || 'I apologize, but I was unable to generate a response.';
    } catch (error: any) {
      console.error('AI Agent Error:', error);

      if (error?.message?.includes('api_key')) {
        return 'API Key Error: Please ensure VITE_ANTHROPIC_API_KEY is set correctly in your Railway environment variables.';
      }

      if (error?.status === 401) {
        return 'Authentication Error: Invalid API key. Please check your VITE_ANTHROPIC_API_KEY.';
      }

      if (error?.status === 429) {
        return 'Rate Limit: Too many requests. Please wait a moment and try again.';
      }

      return `Error: ${error?.message || 'An unexpected error occurred'}. Please try again.`;
    }
  }

  /**
   * Execute tool calls
   */
  private async executeTool(toolName: string, toolInput: any): Promise<any> {
    console.log(`[TOOL] Executing: ${toolName}`, toolInput);

    switch (toolName) {
      case 'calculate_budget':
        return this.calculateBudget(toolInput);

      case 'search_uk_supermarkets':
        return this.searchSupermarkets(toolInput);

      case 'analyze_shopping_list':
        return this.analyzeShoppingList(toolInput);

      case 'suggest_items':
        return this.suggestItems(toolInput);

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }

  /**
   * Budget calculation tool (code interpreter style)
   */
  private calculateBudget(input: any): any {
    const { operation, values } = input;

    try {
      const result: any = {
        operation,
        calculations: {},
      };

      // Perform various budget calculations
      if (values.total !== undefined && values.spent !== undefined) {
        result.calculations.remaining = values.total - values.spent;
        result.calculations.percentageUsed = ((values.spent / values.total) * 100).toFixed(2);
        result.calculations.percentageRemaining = (((values.total - values.spent) / values.total) * 100).toFixed(2);
      }

      if (values.items !== undefined && values.total !== undefined) {
        result.calculations.averageCostPerItem = (values.total / values.items).toFixed(2);
      }

      if (values.currentSpending !== undefined && values.daysInMonth !== undefined) {
        const daysElapsed = values.daysInMonth || 30;
        result.calculations.dailyAverage = (values.currentSpending / daysElapsed).toFixed(2);
        result.calculations.projectedMonthly = (result.calculations.dailyAverage * 30).toFixed(2);
      }

      // Add context from shopping context
      if (this.context) {
        result.context = {
          familyBudget: this.context.currentUser.monthlyBudget,
          spent: this.context.currentUser.currentSpent,
          remaining: this.context.currentUser.monthlyBudget - this.context.currentUser.currentSpent,
          itemCount: this.context.shoppingList.length,
        };
      }

      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * UK Supermarket search tool
   */
  private searchSupermarkets(input: any): any {
    const { item, stores = ['M&S', 'Waitrose', 'Tesco', 'Sainsburys'], max_price } = input;

    // Provide realistic price ranges based on typical UK supermarket pricing
    const priceDatabase: any = {
      'milk': { 'Tesco': { price: 1.45, deals: 'Clubcard price' }, 'Sainsburys': { price: 1.50 }, 'Waitrose': { price: 1.65 }, 'M&S': { price: 1.75 } },
      'bread': { 'Tesco': { price: 0.95 }, 'Sainsburys': { price: 1.00 }, 'Waitrose': { price: 1.20 }, 'M&S': { price: 1.30 } },
      'eggs': { 'Tesco': { price: 2.10, deals: 'Clubcard £1.90' }, 'Sainsburys': { price: 2.20, deals: 'Nectar points' }, 'Waitrose': { price: 2.50 }, 'M&S': { price: 2.80 } },
      'chicken': { 'Tesco': { price: 4.50 }, 'Sainsburys': { price: 4.75 }, 'Waitrose': { price: 5.50 }, 'M&S': { price: 6.00 } },
      'pasta': { 'Tesco': { price: 0.70 }, 'Sainsburys': { price: 0.75 }, 'Waitrose': { price: 1.00 }, 'M&S': { price: 1.20 } },
    };

    const itemLower = item.toLowerCase();
    const results: any = {
      item,
      stores_searched: stores,
      prices: {},
      recommendation: '',
    };

    // Find matching item or provide estimate
    const matchedItem = Object.keys(priceDatabase).find(key => itemLower.includes(key));

    if (matchedItem) {
      stores.forEach((store: string) => {
        if (priceDatabase[matchedItem][store]) {
          results.prices[store] = priceDatabase[matchedItem][store];
        }
      });

      // Find cheapest
      const cheapest = Object.entries(results.prices).sort(
        ([, a]: any, [, b]: any) => a.price - b.price
      )[0];

      results.recommendation = `Best price: ${cheapest[0]} at £${(cheapest[1] as any).price}`;
    } else {
      results.note = `Typical prices for "${item}" - estimates based on category`;
      results.prices = {
        'Tesco': { price: 'Budget-friendly', quality: 'Good' },
        'Sainsburys': { price: 'Mid-range', quality: 'Good' },
        'Waitrose': { price: 'Premium', quality: 'Excellent' },
        'M&S': { price: 'Premium', quality: 'Excellent' },
      };
    }

    if (max_price) {
      results.within_budget = Object.entries(results.prices).filter(
        ([, data]: any) => typeof data.price === 'number' && data.price <= max_price
      );
    }

    return results;
  }

  /**
   * Shopping list analysis tool
   */
  private analyzeShoppingList(input: any): any {
    const { focus } = input;

    if (!this.context) {
      return { error: 'No shopping context available' };
    }

    const { shoppingList, currentUser } = this.context;
    const budgetRemaining = currentUser.monthlyBudget - currentUser.currentSpent;
    const familyBudget = currentUser.monthlyBudget;

    const analysis: any = {
      focus,
      itemCount: shoppingList.length,
      insights: [],
    };

    if (focus === 'budget') {
      const totalCost = shoppingList.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
      analysis.totalCost = totalCost.toFixed(2);
      analysis.budgetImpact = ((totalCost / familyBudget) * 100).toFixed(2);
      analysis.insights.push(`Shopping list costs £${analysis.totalCost} (${analysis.budgetImpact}% of budget)`);

      if (totalCost > budgetRemaining) {
        analysis.insights.push(`⚠️ List exceeds remaining budget by £${(totalCost - budgetRemaining).toFixed(2)}`);
      }
    }

    if (focus === 'health') {
      const categories = shoppingList.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      analysis.categories = categories;
      analysis.insights.push(`Category breakdown: ${JSON.stringify(categories)}`);
    }

    if (focus === 'completeness') {
      const essentials = ['Milk', 'Bread', 'Eggs', 'Fresh produce', 'Protein'];
      const hasEssentials = essentials.filter(essential =>
        shoppingList.some(item => item.name.toLowerCase().includes(essential.toLowerCase()))
      );

      analysis.hasEssentials = hasEssentials;
      analysis.missingEssentials = essentials.filter(e => !hasEssentials.includes(e));

      if (analysis.missingEssentials.length > 0) {
        analysis.insights.push(`Missing essentials: ${analysis.missingEssentials.join(', ')}`);
      }
    }

    return analysis;
  }

  /**
   * Item suggestion tool
   */
  private suggestItems(input: any): any {
    const { category, count = 5 } = input;

    const suggestions: any = {
      category,
      items: [],
    };

    // Provide contextual suggestions based on category
    const suggestionDatabase: any = {
      'essentials': [
        { name: 'Milk', estimatedPrice: 1.45, reason: 'Family essential' },
        { name: 'Bread', estimatedPrice: 0.95, reason: 'Daily staple' },
        { name: 'Eggs (12)', estimatedPrice: 2.10, reason: 'Protein source' },
        { name: 'Butter', estimatedPrice: 1.80, reason: 'Cooking essential' },
        { name: 'Fresh vegetables', estimatedPrice: 3.00, reason: 'Nutrition' },
      ],
      'healthy snacks': [
        { name: 'Fresh fruit', estimatedPrice: 2.50, reason: 'Healthy for Zeth' },
        { name: 'Yogurt', estimatedPrice: 2.00, reason: 'Protein & probiotics' },
        { name: 'Nuts (mixed)', estimatedPrice: 3.50, reason: 'Healthy fats' },
        { name: 'Hummus', estimatedPrice: 1.50, reason: 'Nutritious dip' },
        { name: 'Rice cakes', estimatedPrice: 1.20, reason: 'Low-calorie snack' },
      ],
      'meal ingredients': [
        { name: 'Chicken breast', estimatedPrice: 4.50, reason: 'Lean protein' },
        { name: 'Pasta', estimatedPrice: 0.70, reason: 'Versatile carb' },
        { name: 'Tomato sauce', estimatedPrice: 0.90, reason: 'Meal base' },
        { name: 'Onions', estimatedPrice: 0.60, reason: 'Flavor base' },
        { name: 'Garlic', estimatedPrice: 0.40, reason: 'Essential seasoning' },
      ],
    };

    const categoryItems = suggestionDatabase[category.toLowerCase()] || suggestionDatabase['essentials'];
    suggestions.items = categoryItems.slice(0, count);
    suggestions.estimatedTotal = suggestions.items.reduce((sum: number, item: any) => sum + item.estimatedPrice, 0).toFixed(2);

    return suggestions;
  }

  /**
   * Build system prompt with full context
   */
  private buildSystemPrompt(): string {
    if (!this.context) {
      return 'You are a helpful AI shopping assistant.';
    }

    const { currentUser, shoppingList } = this.context;
    const familyBudget = currentUser.monthlyBudget;
    const budgetSpent = currentUser.currentSpent;
    const budgetRemaining = currentUser.monthlyBudget - currentUser.currentSpent;

    return `You are an advanced AI shopping assistant for a London family's grocery shopping app.

FAMILY CONTEXT:
- Stephen (Dad) - Full shopping access
- Cheslyn/Chez (Mum) - Full shopping access
- Zeth (Son, 16) - Can add up to £200/month to list (currently added: £${currentUser.role === 'teen' ? currentUser.monthlyAddedValue.toFixed(2) : '0.00'})

CURRENT USER: ${currentUser.name} (${currentUser.role === 'parent1' ? 'Stephen/Dad' : currentUser.role === 'parent2' ? 'Cheslyn/Mum' : 'Zeth/Son'})
- Level: ${currentUser.level}
- Points: ${currentUser.points}

BUDGET:
- Family Budget: £${familyBudget.toFixed(2)}/month (one pot for everything)
- Spent: £${budgetSpent.toFixed(2)}
- Remaining: £${budgetRemaining.toFixed(2)}
- Shopping List Items: ${shoppingList.length}
- Estimated List Cost: £${shoppingList.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0).toFixed(2)}

UK SUPERMARKETS (Priority order):
1. M&S (Marks & Spencer) - Premium quality
2. Waitrose - High quality, myWaitrose deals
3. Tesco - All-round, Clubcard savings
4. Sainsbury's - Good value, Nectar points

YOUR CAPABILITIES:
✅ Calculate budgets, spending patterns, projections (use calculate_budget tool)
✅ Search UK supermarket prices (use search_uk_supermarkets tool)
✅ Analyze shopping lists for optimization (use analyze_shopping_list tool)
✅ Suggest items based on needs (use suggest_items tool)

PERSONALITY:
- Be practical and helpful
- Focus on saving money and eating healthy
- Encourage Zeth's participation (he's learning to manage budgets!)
- Provide specific, actionable advice
- Use tools whenever calculations or price comparisons are needed

Remember: This family wants to eat better and save money. Every suggestion should help them achieve that!`;
  }
}

// Export singleton creator
export const createShoppingAssistant = (apiKey: string): ShoppingAssistantAgent => {
  return new ShoppingAssistantAgent(apiKey);
};
