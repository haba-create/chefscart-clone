import Anthropic from '@anthropic-ai/sdk';
import type { AIMessage, ShoppingItem, User } from '../src/types';

/**
 * Shopping Assistant Agent using Anthropic Claude
 * This agent helps with:
 * - Smart shopping suggestions
 * - Price comparisons
 * - Budget advice
 * - Meal planning recommendations
 * - Deal hunting
 */

export class ShoppingAssistantAgent {
  private client: Anthropic;
  private conversationHistory: AIMessage[] = [];

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey || 'placeholder-key', // Will be provided by user
    });
  }

  /**
   * Get AI-powered shopping suggestions based on current context
   */
  async getSuggestions(context: {
    currentUser: User;
    shoppingList: ShoppingItem[];
    budget: number;
    preferences: string[];
  }): Promise<string> {
    const prompt = this.buildSuggestionsPrompt(context);

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0];
      return response.type === 'text' ? response.text : '';
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  /**
   * Chat with the AI assistant
   */
  async chat(
    userMessage: string,
    context: {
      currentUser: User;
      shoppingList: ShoppingItem[];
      budget: number;
    }
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);

    try {
      // Build conversation history
      const messages: Anthropic.MessageParam[] = [
        ...this.conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage,
        },
      ];

      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages,
      });

      const response = message.content[0];
      const responseText = response.type === 'text' ? response.text : '';

      // Update conversation history
      this.conversationHistory.push({
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });

      this.conversationHistory.push({
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      });

      return responseText;
    } catch (error) {
      console.error('Error in AI chat:', error);
      return 'Sorry, I encountered an error. Please make sure your API key is configured correctly.';
    }
  }

  /**
   * Analyze shopping list for budget optimization
   */
  async analyzeBudget(context: {
    shoppingList: ShoppingItem[];
    budget: number;
    currentSpent: number;
  }): Promise<string> {
    const prompt = `You are a budget-conscious shopping advisor. Analyze this shopping list and provide recommendations:

Shopping List:
${context.shoppingList
  .map(
    (item) =>
      `- ${item.name} (${item.quantity} ${item.unit}) - £${item.price || 'unknown'}`
  )
  .join('\n')}

Total Budget: £${context.budget}
Current Spent: £${context.currentSpent}
Remaining: £${context.budget - context.currentSpent}

Provide:
1. Budget analysis
2. Suggestions to save money
3. Items that could be substituted with cheaper alternatives
4. Overall shopping strategy

Keep your response concise and actionable.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0];
      return response.type === 'text' ? response.text : '';
    } catch (error) {
      console.error('Error analyzing budget:', error);
      return 'Unable to analyze budget at this time.';
    }
  }

  /**
   * Get meal suggestions for teens
   */
  async getTeenMealSuggestions(preferences: {
    budget: number;
    dietaryRestrictions: string[];
  }): Promise<string> {
    const prompt = `You are a meal planning expert. Suggest 5 budget-friendly, teen-approved meals for a family in London.

Budget per meal: £${preferences.budget / 7}
Dietary restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}

For each meal, provide:
1. Meal name
2. Quick description (why teens will love it)
3. Estimated cost
4. Key ingredients

Keep it practical, affordable, and appealing to a 16-year-old.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1536,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0];
      return response.type === 'text' ? response.text : '';
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      return 'Unable to get meal suggestions at this time.';
    }
  }

  /**
   * Find deals and compare prices
   */
  async findDeals(item: string, stores: string[]): Promise<string> {
    const prompt = `You are a deal-hunting expert for UK supermarkets.

Item: ${item}
Stores to compare: ${stores.join(', ')}

Provide:
1. Typical price range for this item in London
2. Which stores typically have the best deals
3. Tips for finding this item on sale
4. Generic alternatives that might save money

Note: You don't have real-time pricing, so provide general advice based on typical UK supermarket pricing patterns.`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 768,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0];
      return response.type === 'text' ? response.text : '';
    } catch (error) {
      console.error('Error finding deals:', error);
      return 'Unable to find deals at this time.';
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): AIMessage[] {
    return this.conversationHistory;
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: {
    currentUser: User;
    shoppingList: ShoppingItem[];
    budget: number;
  }): string {
    return `You are a helpful AI shopping assistant for ChefsCart, a family grocery shopping app in London. You help families shop smarter, save money, and eat better.

Current Context:
- User: ${context.currentUser.name} (${context.currentUser.role})
- User Level: ${context.currentUser.level}
- Points: ${context.currentUser.points}
- Budget: £${context.currentUser.monthlyBudget}
- Current Spent: £${context.currentUser.currentSpent}
- Shopping List Items: ${context.shoppingList.length}

You should:
1. Be friendly and encouraging, especially when talking to the teen user
2. Focus on budget-conscious shopping
3. Suggest UK supermarkets (Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl)
4. Recommend teen-friendly meals and snacks
5. Gamify shopping with points and challenges
6. Provide London-specific advice

Keep responses concise and actionable.`;
  }

  /**
   * Build suggestions prompt
   */
  private buildSuggestionsPrompt(context: {
    currentUser: User;
    shoppingList: ShoppingItem[];
    budget: number;
    preferences: string[];
  }): string {
    return `Generate smart shopping suggestions for a family in London.

Current Shopping List:
${context.shoppingList.map((item) => `- ${item.name}`).join('\n')}

Budget: £${context.budget}
User Preferences: ${context.preferences.join(', ')}

Provide 3-5 suggestions for:
1. Items they might be missing
2. Money-saving alternatives
3. Healthy additions
4. Teen-friendly snacks

Keep it brief and practical.`;
  }
}

// Export a singleton instance creator
export const createShoppingAssistant = (apiKey: string): ShoppingAssistantAgent => {
  return new ShoppingAssistantAgent(apiKey);
};
