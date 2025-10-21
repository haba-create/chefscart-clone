import { useStore } from '../src/store';
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

export function BudgetTracker() {
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const shoppingList = useStore((state) => state.shoppingList);

  if (!currentUser) return null;

  const totalFamilyBudget = users.reduce(
    (sum, user) => sum + user.monthlyBudget,
    0
  );
  const totalFamilySpent = users.reduce(
    (sum, user) => sum + user.currentSpent,
    0
  );
  const familyRemaining = totalFamilyBudget - totalFamilySpent;

  const userBudgetPercentage =
    (currentUser.currentSpent / currentUser.monthlyBudget) * 100;

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'red', label: 'Critical', icon: AlertTriangle };
    if (percentage >= 75) return { color: 'yellow', label: 'Warning', icon: AlertTriangle };
    return { color: 'green', label: 'Good', icon: TrendingDown };
  };

  const status = getBudgetStatus(userBudgetPercentage);

  // Mock spending by category
  const spendingCategories = [
    { name: 'Fruits & Vegetables', amount: 45.50, percentage: 25 },
    { name: 'Meat & Fish', amount: 62.30, percentage: 34 },
    { name: 'Dairy & Eggs', amount: 28.20, percentage: 15 },
    { name: 'Snacks', amount: 22.10, percentage: 12 },
    { name: 'Beverages', amount: 15.40, percentage: 8 },
    { name: 'Other', amount: 10.50, percentage: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Current User Budget */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Budget</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1
            ${
              status.color === 'red'
                ? 'bg-red-100 text-red-800'
                : status.color === 'yellow'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            <status.icon className="w-4 h-4" />
            <span>{status.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly Budget</p>
            <p className="text-3xl font-bold text-gray-900">
              £{currentUser.monthlyBudget.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Spent This Month</p>
            <p className="text-3xl font-bold text-blue-600">
              £{currentUser.currentSpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p
              className={`text-3xl font-bold ${
                userBudgetPercentage >= 90
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              £{(currentUser.monthlyBudget - currentUser.currentSpent).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Budget Usage</span>
            <span>{userBudgetPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                userBudgetPercentage >= 90
                  ? 'bg-red-500'
                  : userBudgetPercentage >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(userBudgetPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget Alerts */}
        {userBudgetPercentage >= 75 && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              userBudgetPercentage >= 90
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 ${
                  userBudgetPercentage >= 90 ? 'text-red-600' : 'text-yellow-600'
                }`}
              />
              <div>
                <h4
                  className={`font-semibold ${
                    userBudgetPercentage >= 90
                      ? 'text-red-900'
                      : 'text-yellow-900'
                  }`}
                >
                  {userBudgetPercentage >= 90
                    ? 'Budget Almost Exhausted!'
                    : 'Approaching Budget Limit'}
                </h4>
                <p
                  className={`text-sm ${
                    userBudgetPercentage >= 90
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}
                >
                  You've used {userBudgetPercentage.toFixed(1)}% of your monthly
                  budget. Consider reviewing your shopping list to stay within
                  budget.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Family Budget Overview */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Family Budget Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Family Budget</p>
            <p className="text-2xl font-bold text-gray-900">
              £{totalFamilyBudget.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-blue-600">
              £{totalFamilySpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Family Remaining</p>
            <p className="text-2xl font-bold text-green-600">
              £{familyRemaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Individual User Budgets */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Individual Budgets</h3>
          {users.map((user) => {
            const userPercentage =
              (user.currentSpent / user.monthlyBudget) * 100;
            return (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        £{user.currentSpent.toFixed(2)} / £
                        {user.monthlyBudget.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    {userPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      userPercentage >= 90
                        ? 'bg-red-500'
                        : userPercentage >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(userPercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Shopping List Impact */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Current Shopping List Impact
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Estimated Total</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              £{shoppingList.totalEstimatedCost.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {shoppingList.items.length} items
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">After Purchase</span>
              <TrendingDown className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              £{shoppingList.budgetRemaining.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Remaining budget</p>
          </div>
        </div>

        {shoppingList.totalEstimatedCost > familyRemaining && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">
                  Shopping List Exceeds Budget!
                </h4>
                <p className="text-sm text-red-700">
                  Your current shopping list costs £
                  {shoppingList.totalEstimatedCost.toFixed(2)}, which is £
                  {(shoppingList.totalEstimatedCost - familyRemaining).toFixed(2)}{' '}
                  over your remaining family budget. Consider removing items or
                  finding cheaper alternatives.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spending by Category */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Spending by Category
        </h2>

        <div className="space-y-4">
          {spendingCategories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  £{category.amount.toFixed(2)} ({category.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-primary-500 rounded-full transition-all"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Tips */}
      <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <span>Savings Tips</span>
        </h2>

        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">1</span>
            </div>
            <p className="text-gray-700">
              <strong>Compare prices:</strong> Check Aldi and Lidl for basic
              items - typically 20-30% cheaper than premium supermarkets.
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">2</span>
            </div>
            <p className="text-gray-700">
              <strong>Buy store brands:</strong> Tesco Everyday Value and
              Sainsbury's Basics can save 30-50% vs branded items.
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">3</span>
            </div>
            <p className="text-gray-700">
              <strong>Plan meals ahead:</strong> Reduce impulse purchases and
              food waste by planning your week's meals.
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">4</span>
            </div>
            <p className="text-gray-700">
              <strong>Use loyalty cards:</strong> Tesco Clubcard and Nectar
              points can save £5-10 per shop.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
