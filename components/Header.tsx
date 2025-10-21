import { useStore } from '../src/store';
import { Bell, ShoppingCart, TrendingUp } from 'lucide-react';

export function Header() {
  const currentUser = useStore((state) => state.currentUser);
  const notifications = useStore((state) => state.notifications);
  const shoppingList = useStore((state) => state.shoppingList);

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const totalItems = shoppingList.items.length;
  const purchasedItems = shoppingList.items.filter((i) => i.purchased).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ChefsCart</h1>
              <p className="text-xs text-gray-500">Smart Family Shopping</p>
            </div>
          </div>

          {/* User Info & Stats */}
          <div className="flex items-center space-x-6">
            {/* Shopping Progress */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {purchasedItems}/{totalItems} items
              </span>
            </div>

            {/* Budget Status */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">
                £{shoppingList.budgetRemaining.toFixed(2)} left
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* User Avatar */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {currentUser.level} • {currentUser.points} pts
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
