'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlobalCoinsOverlay } from '@/components/GlobalCoinsOverlay';
import { addFoodItem, getFoodInventory, subscribeFoodInventory, FoodId } from '@/lib/food-inventory';
import { spendGameCoins } from '@/lib/game-coins';

type ShopFood = {
  id: FoodId;
  emoji: string;
  label: string;
  price: number;
};

const shopFoods: ShopFood[] = [
  { id: 'apple', emoji: '🍎', label: 'Яблоко', price: 10 },
  { id: 'cake', emoji: '🍰', label: 'Торт', price: 20 },
  { id: 'steak', emoji: '🥩', label: 'Стейк', price: 30 },
];

export default function ShopPage() {
  const [inventory, setInventory] = useState(getFoodInventory());
  const [showNoMoneyBanner, setShowNoMoneyBanner] = useState(false);

  useEffect(() => subscribeFoodInventory(setInventory), []);

  const buyFood = (food: ShopFood) => {
    const ok = spendGameCoins(food.price);
    if (!ok) {
      setShowNoMoneyBanner(true);
      window.setTimeout(() => {
        setShowNoMoneyBanner(false);
      }, 1000);
      return;
    }

    addFoodItem(food.id, 1);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="floating-shapes">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="pet-card relative overflow-hidden p-8 md:p-10 min-h-[620px] md:min-h-[700px] flex flex-col">
          <GlobalCoinsOverlay />

          <Link
            href="/"
            className="liquid-glass-btn absolute top-4 left-4 z-20 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 transition-colors"
            aria-label="На главную"
            title="На главную"
          >
            <Home size={20} />
          </Link>

          {showNoMoneyBanner && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 rounded-xl bg-red-600/90 text-white px-4 py-2 font-semibold">
              Средств недостаточно
            </div>
          )}

          <div className="mt-12 rounded-2xl bg-black/45 border border-white/20 p-4 backdrop-blur-sm">
            <h1 className="text-center text-3xl font-bold text-white">Еда</h1>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {shopFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => buyFood(food)}
                className="rounded-xl px-4 py-3 bg-black/45 border border-white/25 text-white hover:bg-black/60 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg">{food.emoji} {food.label}</div>
                  <div className="font-semibold">{food.price} монет</div>
                </div>
                <div className="text-xs text-white/80 mt-1">В наличии: {inventory[food.id]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
