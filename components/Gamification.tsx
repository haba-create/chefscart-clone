import { useStore } from '../src/store';
import { Trophy, Star, Target, Award, TrendingUp, Zap } from 'lucide-react';

export function Gamification() {
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const challenges = useStore((state) => state.challenges);

  if (!currentUser) return null;

  const pointsToNextLevel = (currentUser.level * 100) - currentUser.points;
  const levelProgress = (currentUser.points % 100);

  // Leaderboard sorted by points
  const leaderboard = [...users].sort((a, b) => b.points - a.points);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return '💰';
      case 'savings':
        return '💸';
      case 'health':
        return '🥗';
      case 'variety':
        return '🌈';
      default:
        return '🎯';
    }
  };

  const availableBadges = [
    {
      id: 'first-shop',
      name: 'First Shopping Trip',
      description: 'Complete your first shopping list',
      icon: '🛒',
      type: 'bronze' as const,
      unlocked: currentUser.points > 0,
    },
    {
      id: 'budget-master',
      name: 'Budget Master',
      description: 'Stay within budget for a full month',
      icon: '💰',
      type: 'gold' as const,
      unlocked: currentUser.badges.some((b) => b.id === 'budget-master'),
    },
    {
      id: 'deal-hunter',
      name: 'Deal Hunter',
      description: 'Save £50 with price comparisons',
      icon: '🏷️',
      type: 'silver' as const,
      unlocked: currentUser.badges.some((b) => b.id === 'deal-hunter'),
    },
    {
      id: 'health-champion',
      name: 'Health Champion',
      description: 'Add 30 healthy items to shopping lists',
      icon: '🥇',
      type: 'gold' as const,
      unlocked: currentUser.badges.some((b) => b.id === 'health-champion'),
    },
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Vote on 20 family shopping items',
      icon: '👥',
      type: 'bronze' as const,
      unlocked: currentUser.badges.some((b) => b.id === 'team-player'),
    },
    {
      id: 'streak-week',
      name: '7-Day Streak',
      description: 'Log in 7 days in a row',
      icon: '🔥',
      type: 'silver' as const,
      unlocked: currentUser.badges.some((b) => b.id === 'streak-week'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="card bg-gradient-to-br from-purple-500 to-blue-600 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{currentUser.name}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Level {currentUser.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span className="font-semibold">{currentUser.points} Points</span>
              </div>
            </div>
          </div>

          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-4xl">
              {currentUser.role === 'teen' ? '🧑‍🎓' : '👨‍👩'}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {currentUser.level + 1}</span>
            <span>{pointsToNextLevel} points to go</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="h-3 bg-white rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6 text-blue-600" />
          <span>Active Challenges</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const progress = (challenge.currentValue / challenge.targetValue) * 100;

            return (
              <div
                key={challenge.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  challenge.completed
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getChallengeIcon(challenge.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {challenge.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      {challenge.points}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {challenge.currentValue} / {challenge.targetValue}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        challenge.completed ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {challenge.completed && (
                  <div className="mt-3 flex items-center space-x-2 text-green-700">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold text-sm">Completed!</span>
                  </div>
                )}

                {!challenge.completed && (
                  <div className="mt-3 text-sm text-gray-500">
                    Ends {new Date(challenge.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <span>Badges</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {availableBadges.map((badge) => (
            <div
              key={badge.id}
              className={`text-center p-4 rounded-lg border-2 transition-all ${
                badge.unlocked
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div
                className={`text-4xl mb-2 ${
                  badge.unlocked ? '' : 'grayscale opacity-50'
                }`}
              >
                {badge.icon}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                {badge.name}
              </h3>
              <p className="text-xs text-gray-600">{badge.description}</p>
              {badge.unlocked && (
                <div className="mt-2">
                  <span
                    className={`badge badge-${badge.type} text-xs`}
                  >
                    {badge.type}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <span>Family Leaderboard</span>
        </h2>

        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const isCurrentUser = user.id === currentUser.id;
            const medalEmoji =
              index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isCurrentUser
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                    {medalEmoji || `#${index + 1}`}
                  </div>

                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{user.name}</span>
                      {isCurrentUser && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Level {user.level}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">
                    {user.points}
                  </p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-600" />
          <span>How to Earn Points</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Items</h3>
              <p className="text-sm text-gray-600">
                Earn <strong>5 points</strong> for each item you add to the
                shopping list
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Complete Shopping</h3>
              <p className="text-sm text-gray-600">
                Earn <strong>10 points</strong> for each item you purchase
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Complete Challenges</h3>
              <p className="text-sm text-gray-600">
                Earn <strong>50-100 points</strong> for completing challenges
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stay Within Budget</h3>
              <p className="text-sm text-gray-600">
                Earn <strong>25 points</strong> for shopping under budget
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vote on Items</h3>
              <p className="text-sm text-gray-600">
                Earn <strong>2 points</strong> for voting on family items
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Suggest Meals</h3>
              <p className="text-sm text-gray-600">
                Earn <strong>15 points</strong> for meal planning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
