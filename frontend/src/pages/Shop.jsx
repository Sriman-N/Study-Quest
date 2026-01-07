import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Coins, ArrowLeft, Lock, Check } from 'lucide-react';
import axios from 'axios';

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchasing, setPurchasing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [itemsRes, inventoryRes, characterRes] = await Promise.all([
        axios.get('http://localhost:5000/api/shop/items', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/shop/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/character', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setShopItems(itemsRes.data);
      setInventory(inventoryRes.data);
      setCharacter(characterRes.data);
    } catch (error) {
      console.error('Error fetching shop data:', error);
      alert('Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId) => {
    setPurchasing(itemId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/shop/purchase/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      
      // Refresh data
      await fetchShopData();
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error.response?.data?.message || 'Failed to purchase item');
    } finally {
      setPurchasing(null);
    }
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
                      onClick={() => handlePurchase(item.itemId)}
                      disabled={!affordable || purchasing === item.itemId}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        affordable
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {purchasing === item.itemId ? 'Purchasing...' : 
                       !affordable ? 'Not Enough Gold' : 'Purchase'}
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
    </div>
  );
};

export default Shop;