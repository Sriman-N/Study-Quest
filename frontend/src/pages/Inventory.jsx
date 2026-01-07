import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import axios from 'axios';

const Inventory = () => {
  const [inventory, setInventory] = useState(null);
  const [itemDetails, setItemDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/shop/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setInventory(response.data);
      setItemDetails(response.data.itemDetails || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/shop/equip/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      await fetchInventory();
    } catch (error) {
      console.error('Equip error:', error);
      alert(error.response?.data?.message || 'Failed to equip item');
    }
  };

  const handleUnequip = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/shop/unequip/${type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      await fetchInventory();
    } catch (error) {
      console.error('Unequip error:', error);
      alert(error.response?.data?.message || 'Failed to unequip item');
    }
  };

  const isEquipped = (itemId) => {
    return Object.values(inventory?.equipped || {}).includes(itemId);
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
    ? itemDetails 
    : itemDetails.filter(item => item.type === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
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
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">My Inventory</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Visit Shop
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

        {/* Currently Equipped Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Currently Equipped
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['avatar', 'background', 'title'].map(type => {
              const equippedItemId = inventory?.equipped?.[type];
              const equippedItem = itemDetails.find(item => item.itemId === equippedItemId);

              return (
                <div key={type} className="border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-2 capitalize">{type}</p>
                  {equippedItem ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{equippedItem.image}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{equippedItem.name}</p>
                        <button
                          onClick={() => handleUnequip(type)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Unequip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Nothing equipped</p>
                  )}
                </div>
              );
            })}
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

        {/* Inventory Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const equipped = isEquipped(item.itemId);

            return (
              <div
                key={item.itemId}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${getRarityColor(item.rarity)}`}
              >
                {/* Item Image */}
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-8 flex items-center justify-center relative">
                  <span className="text-6xl">{item.image}</span>
                  {equipped && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Equipped
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="p-4">
                  {/* Rarity Badge */}
                  <span className={`text-xs px-2 py-1 rounded text-white font-medium ${getRarityBadgeColor(item.rarity)} inline-block mb-2`}>
                    {item.rarity.toUpperCase()}
                  </span>

                  <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                  {/* Effect (for power-ups) */}
                  {item.effect && (
                    <div className="bg-blue-50 p-2 rounded mb-3">
                      <p className="text-xs text-blue-800 font-medium">{item.effect.description}</p>
                    </div>
                  )}

                  {/* Equip Button */}
                  {item.type !== 'power_up' && (
                    equipped ? (
                      <button
                        onClick={() => handleUnequip(item.type)}
                        className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
                      >
                        Unequip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEquip(item.itemId, item.type)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Equip
                      </button>
                    )
                  )}

                  {item.type === 'power_up' && (
                    <button
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Use Power-up
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">No items in this category yet</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Visit Shop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;