import { useState } from 'react';
import { useStore } from './store';
import { Header } from '@components/Header';
import { ShoppingList } from '@components/ShoppingList';
import { BudgetTracker } from '@components/BudgetTracker';
import { Gamification } from '@components/Gamification';
import { AIAssistant } from '@components/AIAssistant';
import { MealPlanner } from '@components/MealPlanner';
import { UserSwitcher } from '@components/UserSwitcher';

type Tab = 'shopping' | 'budget' | 'gamification' | 'meals' | 'ai';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shopping');
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to ChefsCart</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* User Switcher */}
        <div className="mb-6">
          <UserSwitcher />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 border-b border-gray-200 min-w-max">
            <TabButton
              active={activeTab === 'shopping'}
              onClick={() => setActiveTab('shopping')}
              icon="🛒"
              label="Shopping List"
            />
            <TabButton
              active={activeTab === 'budget'}
              onClick={() => setActiveTab('budget')}
              icon="💰"
              label="Budget"
            />
            <TabButton
              active={activeTab === 'gamification'}
              onClick={() => setActiveTab('gamification')}
              icon="🏆"
              label="Achievements"
            />
            <TabButton
              active={activeTab === 'meals'}
              onClick={() => setActiveTab('meals')}
              icon="🍽️"
              label="Meal Plans"
            />
            <TabButton
              active={activeTab === 'ai'}
              onClick={() => setActiveTab('ai')}
              icon="🤖"
              label="AI Assistant"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'shopping' && <ShoppingList />}
          {activeTab === 'budget' && <BudgetTracker />}
          {activeTab === 'gamification' && <Gamification />}
          {activeTab === 'meals' && <MealPlanner />}
          {activeTab === 'ai' && <AIAssistant />}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-3 font-medium text-sm
        border-b-2 transition-colors whitespace-nowrap
        ${
          active
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default App;
