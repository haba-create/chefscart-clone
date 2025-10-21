import { useStore } from '../src/store';
import { User as UserIcon } from 'lucide-react';
import type { User } from '../src/types';

export function UserSwitcher() {
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  const getRoleLabel = (role: User['role']): string => {
    switch (role) {
      case 'parent1':
        return 'Dad - Shared Budget';
      case 'parent2':
        return 'Mum - Essentials Manager';
      case 'teen':
        return 'Son (16) - Shared Budget';
      default:
        return role;
    }
  };

  const getRoleColor = (role: User['role']): string => {
    switch (role) {
      case 'parent1':
        return 'from-blue-500 to-blue-600';
      case 'parent2':
        return 'from-green-500 to-green-600';
      case 'teen':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <UserIcon className="w-5 h-5" />
          <span>Switch User</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setCurrentUser(user)}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                currentUser?.id === user.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${getRoleColor(
                  user.role
                )} rounded-full flex items-center justify-center text-white font-bold text-lg`}
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-600">
                    Lvl {user.level}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">
                    {user.points} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Budget</span>
                <span>
                  £{user.currentSpent} / £{user.monthlyBudget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (user.currentSpent / user.monthlyBudget) * 100 > 90
                      ? 'bg-red-500'
                      : (user.currentSpent / user.monthlyBudget) * 100 > 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      (user.currentSpent / user.monthlyBudget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
