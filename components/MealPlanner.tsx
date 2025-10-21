import { useState } from 'react';
import { useStore } from '../src/store';
import { Calendar, ChefHat, Plus, Clock, Users, DollarSign } from 'lucide-react';
import type { Recipe, PlannedMeal } from '../src/types';

// Sample recipes for demo
const sampleRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta with rich meat sauce',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'easy',
    ingredients: [
      { name: 'Spaghetti', quantity: 500, unit: 'g' },
      { name: 'Minced beef', quantity: 500, unit: 'g' },
      { name: 'Tomato sauce', quantity: 400, unit: 'g' },
      { name: 'Onion', quantity: 1, unit: 'items' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
    ],
    instructions: [
      'Cook spaghetti according to package directions',
      'Brown minced beef in a large pan',
      'Add onions and garlic, cook until soft',
      'Add tomato sauce and simmer for 20 minutes',
      'Serve sauce over spaghetti',
    ],
    nutrition: {
      calories: 520,
      protein: 28,
      carbs: 65,
      fat: 15,
      fiber: 5,
      sugar: 8,
    },
    tags: ['pasta', 'beef', 'italian', 'family-friendly'],
    estimatedCost: 8.5,
    suitableForTeens: true,
  },
  {
    id: 'recipe-2',
    name: 'Chicken Stir-Fry',
    description: 'Quick and healthy Asian-inspired chicken with vegetables',
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    difficulty: 'easy',
    ingredients: [
      { name: 'Chicken breast', quantity: 500, unit: 'g' },
      { name: 'Mixed vegetables', quantity: 400, unit: 'g' },
      { name: 'Soy sauce', quantity: 3, unit: 'tbsp' },
      { name: 'Rice', quantity: 300, unit: 'g' },
      { name: 'Ginger', quantity: 1, unit: 'tbsp' },
    ],
    instructions: [
      'Cook rice according to package',
      'Cut chicken into strips',
      'Stir-fry chicken until cooked',
      'Add vegetables and stir-fry for 5 minutes',
      'Add soy sauce and ginger, cook for 2 more minutes',
    ],
    nutrition: {
      calories: 380,
      protein: 32,
      carbs: 45,
      fat: 8,
      fiber: 4,
      sugar: 5,
    },
    tags: ['chicken', 'asian', 'healthy', 'quick'],
    estimatedCost: 10.0,
    suitableForTeens: true,
  },
  {
    id: 'recipe-3',
    name: 'Homemade Pizza',
    description: 'Make your own pizza with favorite toppings',
    servings: 4,
    prepTime: 20,
    cookTime: 15,
    difficulty: 'medium',
    ingredients: [
      { name: 'Pizza dough', quantity: 500, unit: 'g' },
      { name: 'Tomato sauce', quantity: 200, unit: 'g' },
      { name: 'Mozzarella cheese', quantity: 300, unit: 'g' },
      { name: 'Pepperoni', quantity: 100, unit: 'g' },
      { name: 'Mushrooms', quantity: 100, unit: 'g' },
    ],
    instructions: [
      'Preheat oven to 220°C',
      'Roll out pizza dough',
      'Spread tomato sauce on dough',
      'Add cheese and toppings',
      'Bake for 12-15 minutes until golden',
    ],
    nutrition: {
      calories: 450,
      protein: 22,
      carbs: 52,
      fat: 18,
      fiber: 3,
      sugar: 6,
    },
    tags: ['pizza', 'italian', 'customizable', 'teen-favorite'],
    estimatedCost: 7.5,
    suitableForTeens: true,
  },
  {
    id: 'recipe-4',
    name: 'Fish and Chips',
    description: 'British classic - crispy fish with homemade chips',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'medium',
    ingredients: [
      { name: 'White fish fillets', quantity: 4, unit: 'items' },
      { name: 'Potatoes', quantity: 1, unit: 'kg' },
      { name: 'Flour', quantity: 200, unit: 'g' },
      { name: 'Breadcrumbs', quantity: 150, unit: 'g' },
      { name: 'Eggs', quantity: 2, unit: 'items' },
    ],
    instructions: [
      'Cut potatoes into chips and parboil',
      'Coat fish in flour, egg, and breadcrumbs',
      'Bake chips at 200°C for 25 minutes',
      'Fry or bake fish until golden',
      'Serve with mushy peas',
    ],
    nutrition: {
      calories: 580,
      protein: 35,
      carbs: 68,
      fat: 20,
      fiber: 6,
      sugar: 2,
    },
    tags: ['fish', 'british', 'comfort-food'],
    estimatedCost: 12.0,
    suitableForTeens: true,
  },
  {
    id: 'recipe-5',
    name: 'Taco Night',
    description: 'Build-your-own tacos with all the fixings',
    servings: 4,
    prepTime: 15,
    cookTime: 20,
    difficulty: 'easy',
    ingredients: [
      { name: 'Taco shells', quantity: 12, unit: 'items' },
      { name: 'Minced beef', quantity: 500, unit: 'g' },
      { name: 'Taco seasoning', quantity: 1, unit: 'packet' },
      { name: 'Lettuce', quantity: 1, unit: 'head' },
      { name: 'Cheese', quantity: 200, unit: 'g' },
      { name: 'Salsa', quantity: 1, unit: 'jar' },
    ],
    instructions: [
      'Brown minced beef in a pan',
      'Add taco seasoning and water',
      'Simmer for 10 minutes',
      'Prepare toppings',
      'Let everyone build their own tacos',
    ],
    nutrition: {
      calories: 420,
      protein: 26,
      carbs: 38,
      fat: 20,
      fiber: 4,
      sugar: 4,
    },
    tags: ['mexican', 'interactive', 'family-fun', 'customizable'],
    estimatedCost: 9.0,
    suitableForTeens: true,
  },
];

export function MealPlanner() {
  const currentUser = useStore((state) => state.currentUser);
  const addPoints = useStore((state) => state.addPoints);
  const addShoppingItem = useStore((state) => state.addShoppingItem);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);

  const handleAddToShoppingList = (recipe: Recipe) => {
    if (!currentUser) return;

    recipe.ingredients.forEach((ingredient) => {
      addShoppingItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: 'Meal Plan',
        addedBy: currentUser.id,
        purchased: false,
        urgency: 'medium',
      });
    });

    // Award points for meal planning
    addPoints(currentUser.id, 15);

    alert(`Added ${recipe.ingredients.length} ingredients to shopping list!`);
  };

  const handlePlanMeal = (recipe: Recipe, date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!currentUser) return;

    const newMeal: PlannedMeal = {
      id: `meal-${Date.now()}`,
      recipeId: recipe.id,
      recipe,
      date,
      mealType,
      suggestedBy: currentUser.id,
    };

    setPlannedMeals([...plannedMeals, newMeal]);
    addPoints(currentUser.id, 10);
    alert('Meal added to your plan!');
  };

  const getDifficultyColor = (difficulty: Recipe['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Meal Planner</h2>
              <p className="text-sm text-gray-600">
                Plan your weekly meals and generate shopping lists
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Planned Meals</p>
          <p className="text-2xl font-bold text-blue-600">{plannedMeals.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Available Recipes</p>
          <p className="text-2xl font-bold text-green-600">
            {sampleRecipes.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Teen-Friendly</p>
          <p className="text-2xl font-bold text-purple-600">
            {sampleRecipes.filter((r) => r.suitableForTeens).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Avg Cost/Meal</p>
          <p className="text-2xl font-bold text-orange-600">
            £
            {(
              sampleRecipes.reduce((sum, r) => sum + r.estimatedCost, 0) /
              sampleRecipes.length
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recipe Browser */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Browse Recipes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {/* Recipe Card */}
              <div className="aspect-video bg-gradient-to-br from-orange-200 to-red-300 flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-white" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{recipe.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                      recipe.difficulty
                    )}`}
                  >
                    {recipe.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {recipe.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>£{recipe.estimatedCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🔥 {recipe.nutrition.calories} cal</span>
                  </div>
                </div>

                {recipe.suitableForTeens && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                    Teen Approved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRecipe.name}
                  </h2>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-500 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Recipe Info */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Prep</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRecipe.prepTime}m
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Cook</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRecipe.cookTime}m
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Servings</p>
                  <p className="font-semibold text-gray-900">
                    {selectedRecipe.servings}
                  </p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Cost</p>
                  <p className="font-semibold text-gray-900">
                    £{selectedRecipe.estimatedCost}
                  </p>
                </div>
              </div>

              {/* Nutrition */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Nutrition (per serving)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Calories</p>
                    <p className="font-semibold">
                      {selectedRecipe.nutrition.calories}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Protein</p>
                    <p className="font-semibold">
                      {selectedRecipe.nutrition.protein}g
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p className="text-xs text-gray-600">Carbs</p>
                    <p className="font-semibold">
                      {selectedRecipe.nutrition.carbs}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-3 text-gray-700"
                    >
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAddToShoppingList(selectedRecipe)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add to Shopping List</span>
                </button>
                <button
                  onClick={() => {
                    handlePlanMeal(selectedRecipe, new Date(), 'dinner');
                    setSelectedRecipe(null);
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Plan Meal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ChefHat className="w-5 h-5 text-orange-600" />
          <span>Meal Planning Tips</span>
        </h3>

        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <span className="text-xl">1️⃣</span>
            <p className="text-gray-700">
              <strong>Plan for the week:</strong> Choose 5-6 meals to reduce
              decision fatigue and food waste
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-xl">2️⃣</span>
            <p className="text-gray-700">
              <strong>Batch cook:</strong> Make larger portions and freeze extras
              for busy days
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-xl">3️⃣</span>
            <p className="text-gray-700">
              <strong>Use leftovers:</strong> Plan meals that use similar
              ingredients to reduce waste
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-xl">4️⃣</span>
            <p className="text-gray-700">
              <strong>Mix it up:</strong> Balance easy quick meals with more
              involved cooking projects
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
