import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Sparkles, Package } from 'lucide-react';

const Shop = () => {
  const [shopItems, setShopItems] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [character, setCharacter] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('avatars');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShopData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShopData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [itemsRes, inventoryRes, characterRes] = await Promise.all([
        axios.get('http://localhost:5000/api/shop/items', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/shop/inventory', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/characters', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setShopItems(itemsRes.data);
      setInventory(inventoryRes.data);
      setCharacter(characterRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setLoading(false);
    }
  };

  const handlePurchase = async (item, category) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/shop/purchase',
        {
          itemId: item.id,
          itemType: category
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update state
      setInventory(response.data.inventory);
      setCharacter({ ...character, gold: response.data.remainingGold });
      
      alert(`Successfully purchased ${item.name}!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Purchase failed');
    }
  };

  const handleEquip = async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/shop/equip',
        {
          itemId,
          itemType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setInventory(response.data.inventory);
      alert('Item equipped successfully!');
      
      // Reload character data to show new avatar
      const characterRes = await axios.get('http://localhost:5000/api/characters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCharacter(characterRes.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Equip failed');
    }
  };

  const isOwned = (itemId) => {
    return inventory?.items?.some(i => i.itemId === itemId);
  };

  const isEquipped = (itemId, type) => {
    if (type === 'avatars') return inventory?.equipped?.avatar === itemId;
    if (type === 'backgrounds') return inventory?.equipped?.background === itemId;
    if (type === 'titles') return inventory?.equipped?.title === itemId;
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

  const getRarityBadge = (rarity) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return (
      <span className={`${colors[rarity]} text-white text-xs px-2 py-1 rounded-full uppercase font-bold`}>
        {rarity}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">Loading shop...</div>
      </div>
    );
  }

  const categories = {
    avatars: { name: 'Avatars', icon: '🎭' },
    powerUps: { name: 'Power-Ups', icon: '⚡' },
    backgrounds: { name: 'Backgrounds', icon: '🎨' },
    titles: { name: 'Titles', icon: '👑' }
  };

  const currentItems = shopItems?.[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Shop</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg px-6 py-3">
              <span className="text-yellow-800 font-bold text-xl">
                💰 {character?.gold || 0} Gold
              </span>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Package className="w-5 h-5" />
              Inventory
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

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {Object.entries(categories).map(([key, { name, icon }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{icon}</span>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => {
            const owned = isOwned(item.id);
            const equipped = isEquipped(item.id, selectedCategory);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-4 ${getRarityColor(item.rarity)}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-6xl">{item.emoji}</div>
                    {getRarityBadge(item.rarity)}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-yellow-600">
                        💰 {item.price}
                      </span>
                    </div>

                    {equipped ? (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Equipped
                      </div>
                    ) : owned ? (
                      <button
                        onClick={() => handleEquip(item.id, selectedCategory)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item, selectedCategory)}
                        disabled={character?.gold < item.price}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;