import { useState, useRef, useEffect } from 'react';
import { useStore } from '../src/store';
import { createShoppingAssistant } from '@agents/shoppingAssistant';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';

export function AIAssistant() {
  const currentUser = useStore((state) => state.currentUser);
  const shoppingList = useStore((state) => state.shoppingList);
  const users = useStore((state) => state.users);
  const aiMessages = useStore((state) => state.aiMessages);
  const addAIMessage = useStore((state) => state.addAIMessage);
  const clearAIMessages = useStore((state) => state.clearAIMessages);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistant, setAssistant] = useState<ReturnType<
    typeof createShoppingAssistant
  > | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize assistant from environment variable on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'undefined' && apiKey !== '') {
      console.log('✓ API key loaded from environment');
      const newAssistant = createShoppingAssistant(apiKey);
      setAssistant(newAssistant);
    } else {
      console.error('❌ VITE_ANTHROPIC_API_KEY environment variable not set');
    }
  }, []);

  // Update assistant context when user or shopping list changes
  useEffect(() => {
    if (assistant && currentUser) {
      assistant.setContext({
        currentUser,
        users,
        shoppingList: shoppingList.items,
        budget: currentUser.monthlyBudget - currentUser.currentSpent,
      });
    }
  }, [assistant, currentUser, users, shoppingList]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser) return;

    if (!assistant) {
      addAIMessage({
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'AI Assistant is not available. Please ensure VITE_ANTHROPIC_API_KEY is set in your environment.',
        timestamp: new Date(),
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    addAIMessage({
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    try {
      const response = await assistant.chat(userMessage);

      addAIMessage({
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      addAIMessage({
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease ensure:\n1. VITE_ANTHROPIC_API_KEY is set in Railway\n2. Your API key is valid\n3. You have credits in your Anthropic account\n4. Your internet connection is working`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!currentUser) return;

    if (!assistant) {
      addAIMessage({
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'AI Assistant is not available. Please ensure VITE_ANTHROPIC_API_KEY is set in your environment.',
        timestamp: new Date(),
      });
      return;
    }

    setIsLoading(true);

    try {
      let userMessage = '';

      switch (action) {
        case 'suggestions':
          userMessage = 'Can you give me some smart suggestions for my shopping list based on my budget and preferences?';
          break;
        case 'budget':
          userMessage = 'Can you analyze my budget and give me tips on how to optimize my spending and save money?';
          break;
        case 'meals':
          userMessage = 'Can you suggest some teen-friendly meal ideas that fit within my budget?';
          break;
        case 'search':
          userMessage = 'Can you search for weekly essentials across M&S, Waitrose, Tesco, and Sainsburys and compare prices?';
          break;
        default:
          return;
      }

      // Add user message
      addAIMessage({
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });

      const response = await assistant.chat(userMessage);

      addAIMessage({
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error('Error with quick action:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      addAIMessage({
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}\n\nPlease ensure VITE_ANTHROPIC_API_KEY is set in Railway.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              AI Shopping Assistant
            </h2>
            <p className="text-sm text-gray-600">
              Powered by Anthropic Claude with Tools API
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {aiMessages.length === 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleQuickAction('search')}
              disabled={isLoading}
              className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg hover:border-orange-400 transition-all text-left disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6 text-orange-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">
                Search Supermarkets
              </h4>
              <p className="text-sm text-gray-600">
                Compare M&S, Waitrose, Tesco, Sainsbury's
              </p>
            </button>

            <button
              onClick={() => handleQuickAction('suggestions')}
              disabled={isLoading}
              className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-400 transition-all text-left disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">
                Get Suggestions
              </h4>
              <p className="text-sm text-gray-600">
                Smart suggestions for your shopping list
              </p>
            </button>

            <button
              onClick={() => handleQuickAction('budget')}
              disabled={isLoading}
              className="p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-400 transition-all text-left disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">
                Analyze Budget
              </h4>
              <p className="text-sm text-gray-600">
                Get tips to optimize your spending
              </p>
            </button>

            <button
              onClick={() => handleQuickAction('meals')}
              disabled={isLoading}
              className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:border-purple-400 transition-all text-left disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">
                Meal Ideas
              </h4>
              <p className="text-sm text-gray-600">
                Teen-friendly meal suggestions
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="card">
        <div className="h-[500px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {aiMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hello! I'm your AI Shopping Assistant
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    I can help you with shopping suggestions, budget analysis,
                    meal planning, and price comparisons. Try the quick actions
                    above or ask me anything!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-blue-500'
                            : 'bg-gradient-to-br from-purple-500 to-blue-600'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div
                        className={`px-4 py-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 px-4 py-3 rounded-lg">
                        <Loader className="w-5 h-5 text-gray-600 animate-spin" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about shopping, budgets, or meals..."
                className="input-field flex-1"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="btn-primary px-6"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {aiMessages.length > 0 && (
              <button
                onClick={() => {
                  clearAIMessages();
                  assistant?.clearHistory();
                }}
                className="text-sm text-gray-600 hover:text-gray-900 mt-2"
              >
                Clear conversation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4">
          AI-First Shopping Assistant
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white">🔍</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">UK Supermarket Search</h4>
              <p className="text-sm text-gray-600">
                Search and compare prices across M&S, Waitrose, Tesco, and Sainsbury's
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white">🧮</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Budget Calculator</h4>
              <p className="text-sm text-gray-600">
                Code interpreter for complex budget calculations and spending predictions
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white">📊</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">List Analysis</h4>
              <p className="text-sm text-gray-600">
                Analyze shopping list for budget, health, and optimization opportunities
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Smart Suggestions</h4>
              <p className="text-sm text-gray-600">
                AI-powered item suggestions based on family patterns and preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
