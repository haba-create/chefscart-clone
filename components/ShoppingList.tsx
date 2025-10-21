import { useState } from 'react';
import { useStore } from '../src/store';
import {
  Plus,
  Trash2,
  Check,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import type { ShoppingItem } from '../src/types';

export function ShoppingList() {
  const currentUser = useStore((state) => state.currentUser);
  const shoppingList = useStore((state) => state.shoppingList);
  const addShoppingItem = useStore((state) => state.addShoppingItem);
  const removeShoppingItem = useStore((state) => state.removeShoppingItem);
  const toggleItemPurchased = useStore((state) => state.toggleItemPurchased);
  const voteOnItem = useStore((state) => state.voteOnItem);
  const addPoints = useStore((state) => state.addPoints);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'items',
    category: 'Other',
    price: 0,
    urgency: 'medium' as const,
  });

  const handleAddItem = () => {
    if (!currentUser || !newItem.name) return;

    addShoppingItem({
      ...newItem,
      addedBy: currentUser.id,
      purchased: false,
    });

    // Award points for adding items
    addPoints(currentUser.id, 5);

    // Reset form
    setNewItem({
      name: '',
      quantity: 1,
      unit: 'items',
      category: 'Other',
      price: 0,
      urgency: 'medium',
    });
    setShowAddForm(false);
  };

  const handleTogglePurchased = (itemId: string) => {
    toggleItemPurchased(itemId);
    if (currentUser) {
      addPoints(currentUser.id, 10); // Award points for completing items
    }
  };

  const handleVote = (
    itemId: string,
    vote: 'approve' | 'reject' | 'neutral'
  ) => {
    if (!currentUser) return;
    voteOnItem(itemId, currentUser.id, vote);
  };

  const getVoteSummary = (item: ShoppingItem) => {
    const approves = item.votes.filter((v) => v.vote === 'approve').length;
    const rejects = item.votes.filter((v) => v.vote === 'reject').length;
    return { approves, rejects };
  };

  const getUserVote = (item: ShoppingItem) => {
    if (!currentUser) return null;
    return item.votes.find((v) => v.userId === currentUser.id);
  };

  const categories = [
    'Fruits & Vegetables',
    'Meat & Fish',
    'Dairy & Eggs',
    'Bakery',
    'Pantry',
    'Frozen',
    'Snacks',
    'Beverages',
    'Other',
  ];

  const urgencyColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-red-100 text-red-600',
  };

  const purchasedItems = shoppingList.items.filter((item) => item.purchased);
  const unpurchasedItems = shoppingList.items.filter((item) => !item.purchased);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">
              {shoppingList.items.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Purchased</p>
            <p className="text-2xl font-bold text-green-600">
              {purchasedItems.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estimated Cost</p>
            <p className="text-2xl font-bold text-blue-600">
              £{shoppingList.totalEstimatedCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget Left</p>
            <p className="text-2xl font-bold text-purple-600">
              £{shoppingList.budgetRemaining.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Add Item Section */}
      <div className="card">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item to Shopping List</span>
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Add New Item</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="e.g., Milk, Bread, Apples"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="input-field flex-1"
                  />
                  <select
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                    className="input-field w-24"
                  >
                    <option value="items">items</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Price (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={handleAddItem} className="btn-primary">
                Add Item
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shopping Items */}
      {unpurchasedItems.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <span>To Buy ({unpurchasedItems.length})</span>
          </h3>

          <div className="space-y-3">
            {unpurchasedItems.map((item) => {
              const { approves, rejects } = getVoteSummary(item);
              const userVote = getUserVote(item);

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTogglePurchased(item.id)}
                          className="w-6 h-6 border-2 border-gray-300 rounded-md hover:border-green-500 transition-colors flex items-center justify-center"
                        >
                          {item.purchased && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </button>

                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span>
                              {item.quantity} {item.unit}
                            </span>
                            <span>•</span>
                            <span>{item.category}</span>
                            {item.price && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-green-600">
                                  £{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            urgencyColors[item.urgency]
                          }`}
                        >
                          {item.urgency}
                        </span>
                      </div>

                      {/* Voting */}
                      <div className="flex items-center space-x-4 mt-3">
                        <button
                          onClick={() => handleVote(item.id, 'approve')}
                          className={`flex items-center space-x-1 text-sm ${
                            userVote?.vote === 'approve'
                              ? 'text-green-600 font-semibold'
                              : 'text-gray-600 hover:text-green-600'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{approves}</span>
                        </button>

                        <button
                          onClick={() => handleVote(item.id, 'reject')}
                          className={`flex items-center space-x-1 text-sm ${
                            userVote?.vote === 'reject'
                              ? 'text-red-600 font-semibold'
                              : 'text-gray-600 hover:text-red-600'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>{rejects}</span>
                        </button>

                        {item.notes && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4" />
                            <span>{item.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeShoppingItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Purchased Items */}
      {purchasedItems.length > 0 && (
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Purchased ({purchasedItems.length})</span>
          </h3>

          <div className="space-y-2">
            {purchasedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg opacity-60"
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTogglePurchased(item.id)}
                    className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <div>
                    <p className="font-medium text-gray-900 line-through">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                {item.price && (
                  <span className="text-sm font-semibold text-gray-600">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {shoppingList.items.length === 0 && (
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No items in your shopping list
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding items to plan your grocery shopping!
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Item</span>
          </button>
        </div>
      )}
    </div>
  );
}
