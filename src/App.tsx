import { useState } from 'react';
import { useStore } from './store';
import { Header } from '@components/Header';
import { Trolley } from '@components/Trolley';
import { BudgetTracker } from '@components/BudgetTracker';
import { Gamification } from '@components/Gamification';
import { AIAssistant } from '@components/AIAssistant';
import { MealPlanner } from '@components/MealPlanner';
import { UserSwitcher } from '@components/UserSwitcher';

type MainTab = 'trolley' | 'budget' | 'gamification' | 'meals';

function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('trolley');
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Panel - AI Assistant (33%) - Full Height */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-semibold text-primary-900">AI Assistant</h2>
          </div>
          <p className="text-xs text-primary-700 mt-1">Ask me anything about groceries, budgets, or recipes</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <AIAssistant />
        </div>
      </div>

      {/* Right Panel - Main Content (67%) */}
      <div className="w-2/3 flex flex-col bg-gray-50">
        {/* Header */}
        <Header />

        {/* User Switcher */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <UserSwitcher />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-1">
            <TabButton
              active={activeTab === 'trolley'}
              onClick={() => setActiveTab('trolley')}
              icon="🛒"
              label="Trolley"
            />
            <TabButton
              active={activeTab === 'meals'}
              onClick={() => setActiveTab('meals')}
              icon="🍽️"
              label="Meal Plans"
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
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'trolley' && <Trolley />}
            {activeTab === 'budget' && <BudgetTracker />}
            {activeTab === 'gamification' && <Gamification />}
            {activeTab === 'meals' && <MealPlanner />}
          </div>
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
