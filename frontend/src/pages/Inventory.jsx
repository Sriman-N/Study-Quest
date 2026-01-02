import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowLeft, Sparkles } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/shop/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  const handleEquip = async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/shop/equip',
        { itemId, itemType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchInventory();
      alert('Item equipped successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Equip failed');
    }
  };

  const isEquipped = (itemId, type) => {
    if (type === 'avatar') return inventory?.equipped?.avatar === itemId;
    if (type === 'background') return inventory?.equipped?.background === itemId;
    if (type === 'cosmetic') return inventory?.equipped?.title === itemId;
    return false;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading inventory...</div>
      </div>
    );
  }

  const groupedItems = {
    avatar: [],
    background: [],
    power_up: [],
    cosmetic: []
  };

  inventory?.items?.forEach(item => {
    groupedItems[item.type]?.push(item);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">My Inventory</h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Visit Shop
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </button>
          </div>
        </div>

        {inventory?.items?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your inventory is empty</h2>
            <p className="text-gray-600 mb-6">Visit the shop to purchase items!</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([type, items]) => {
              if (items.length === 0) return null;

              const typeNames = {
                avatar: 'Avatars',
                background: 'Backgrounds',
                power_up: 'Power-Ups',
                cosmetic: 'Titles & Cosmetics'
              };

              return (
                <div key={type}>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{typeNames[type]}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => {
                      const equipped = isEquipped(item.itemId, item.type);

                      return (
                        <div
                          key={item._id}
                          className={`bg-white rounded-lg shadow-md p-6 border-2 ${getRarityColor(item.rarity)}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                              item.rarity === 'legendary' ? 'bg-yellow-500 text-white' :
                              item.rarity === 'epic' ? 'bg-purple-500 text-white' :
                              item.rarity === 'rare' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {item.rarity}
                            </span>
                          </div>

                          {equipped ? (
                            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Equipped
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEquip(item.itemId, item.type)}
                              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold"
                            >
                              Equip
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;