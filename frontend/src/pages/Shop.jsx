import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Coins, ArrowLeft, Lock, Check, X, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasing, setPurchasing] = useState(null);
  const [error, setError] = useState(null);
  const [confirmPurchase, setConfirmPurchase] = useState(null); // New state for confirmation modal
  const navigate = useNavigate();

  const fetchShopData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const [itemsRes, inventoryRes, characterRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/shop/items`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/shop/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/characters`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setShopItems(itemsRes.data);
      setInventory(inventoryRes.data);
      setCharacter(characterRes.data);
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setError(error.response?.data?.message || 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handlePurchaseClick = (item) => {
    setConfirmPurchase(item);
  };

  const handleConfirmPurchase = async () => {
    if (!confirmPurchase) return;
    
    setPurchasing(confirmPurchase.itemId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/shop/purchase/${confirmPurchase.itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message
      setConfirmPurchase(null);
      showSuccessNotification(response.data.message);
      
      // Refresh data
      await fetchShopData();
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error.response?.data?.message || 'Failed to purchase item');
    } finally {
      setPurchasing(null);
    }
  };

  const handleCancelPurchase = () => {
    setConfirmPurchase(null);
  };

  const showSuccessNotification = (message) => {
    // You can replace this with a toast notification library later
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in';
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const isItemOwned = (itemId) => {
    return inventory?.items?.some(item => item.itemId === itemId);
  };

  const canAfford = (price) => {
    return character?.gold >= price;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-400 bg-gray-50',
      rare: 'border-blue-400 bg-blue-50',
      epic: 'border-purple-400 bg-purple-50',
      legendary: 'border-yellow-400 bg-yellow-50'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBadgeColor = (rarity) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity] || colors.common;
  };

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'avatar', name: 'Avatars' },
    { id: 'background', name: 'Backgrounds' },
    { id: 'title', name: 'Titles' },
    { id: 'power_up', name: 'Power-ups' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <ShoppingBag className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Shop</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchShopData}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Item Shop</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Gold Display */}
            <div className="bg-yellow-100 px-4 py-2 rounded-lg flex items-center gap-2 border-2 border-yellow-400">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-800">{character?.gold || 0}</span>
            </div>

            <button
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              My Inventory
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const owned = isItemOwned(item.itemId);
            const affordable = canAfford(item.price);
            const locked = character?.level < item.levelRequired;

            return (
              <div
                key={item.itemId}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${getRarityColor(item.rarity)} ${
                  locked ? 'opacity-60' : ''
                }`}
              >
                {/* Item Image */}
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-8 flex items-center justify-center">
                  <span className="text-6xl">{item.image}</span>
                </div>

                {/* Item Details */}
                <div className="p-4">
                  {/* Rarity Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded text-white font-medium ${getRarityBadgeColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                    {owned && (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Owned
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                  {/* Effect (for power-ups) */}
                  {item.effect && (
                    <div className="bg-blue-50 p-2 rounded mb-3">
                      <p className="text-xs text-blue-800 font-medium">{item.effect.description}</p>
                    </div>
                  )}

                  {/* Price & Level Requirement */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="font-bold text-gray-800">{item.price}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Level {item.levelRequired}+
                    </div>
                  </div>

                  {/* Purchase Button */}
                  {owned ? (
                    <button
                      disabled
                      className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                      Already Owned
                    </button>
                  ) : locked ? (
                    <button
                      disabled
                      className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Level {item.levelRequired} Required
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchaseClick(item)}
                      disabled={!affordable}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        affordable
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!affordable ? 'Not Enough Gold' : 'Purchase'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No items available in this category</p>
          </div>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      {confirmPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className={`p-6 border-b-4 ${getRarityColor(confirmPurchase.rarity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{confirmPurchase.image}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{confirmPurchase.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded text-white font-medium ${getRarityBadgeColor(confirmPurchase.rarity)}`}>
                      {confirmPurchase.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCancelPurchase}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">{confirmPurchase.description}</p>

              {/* Effect for power-ups */}
              {confirmPurchase.effect && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Special Effect</p>
                    <p className="text-blue-800 text-sm">{confirmPurchase.effect.description}</p>
                  </div>
                </div>
              )}

              {/* Purchase Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-gray-800 text-lg">{confirmPurchase.price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Gold:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-gray-800 text-lg">{character?.gold || 0}</span>
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-gray-600">After Purchase:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-purple-600 text-lg">
                      {(character?.gold || 0) - confirmPurchase.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning if low on gold */}
              {(character?.gold || 0) - confirmPurchase.price < 50 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-yellow-800 text-sm flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    You'll have low gold after this purchase. Complete daily challenges to earn more!
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={handleCancelPurchase}
                disabled={purchasing === confirmPurchase.itemId}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={purchasing === confirmPurchase.itemId}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {purchasing === confirmPurchase.itemId ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Purchasing...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    Confirm Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;