'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { petAPI } from '@/lib/api';
import { triggerLaughAnimation } from '@/lib/pet-animation';
import { LocationPetDisplay } from '@/components/LocationPetDisplay';
import { GlobalCoinsOverlay } from '@/components/GlobalCoinsOverlay';
import { consumeFoodItem, getFoodInventory, subscribeFoodInventory, FoodId } from '@/lib/food-inventory';

export default function KitchenLocationPage() {
  const [satiety, setSatiety] = useState(50);
  const [loading, setLoading] = useState(false);
  const [eatingAnimationKey, setEatingAnimationKey] = useState(0);
  const [inventory, setInventory] = useState(getFoodInventory());
  const requestVersionRef = useRef(0);

  const loadPet = async () => {
    const requestVersion = ++requestVersionRef.current;
    try {
      const pet = await petAPI.getPet();
      if (requestVersion !== requestVersionRef.current) return;
      const satietyValue = Math.max(0, Math.min(100, Math.round(100 - (pet?.hunger ?? 50))));
      setSatiety(satietyValue);
    } catch (error) {
      console.error('Ошибка загрузки питомца:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await loadPet();
    };

    init();
    const interval = setInterval(() => {
      if (mounted) loadPet();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => subscribeFoodInventory(setInventory), []);

  const feedBy = async (foodId: FoodId, amount: number) => {
    if (loading || inventory[foodId] <= 0) return;

    setEatingAnimationKey((prev) => prev + 1);
    setLoading(true);
    const previousSatiety = satiety;
    try {
      const updatedPet = (await petAPI.feedPetWithAmount(amount)) as unknown as { hunger?: number };
      if (typeof updatedPet?.hunger === 'number') {
        const satietyValue = Math.max(0, Math.min(100, Math.round(100 - updatedPet.hunger)));
        setSatiety(satietyValue);
        if (satietyValue > previousSatiety) {
          triggerLaughAnimation();
        }
      } else {
        await loadPet();
      }
      consumeFoodItem(foodId, 1);
    } catch (error) {
      console.error('Ошибка кормления питомца:', error);
    } finally {
      setLoading(false);
    }
  };

  const foods = [
    { id: 'apple' as FoodId, emoji: '🍎', label: 'Яблоко', amount: 20 },
    { id: 'cake' as FoodId, emoji: '🍰', label: 'Торт', amount: 40 },
    { id: 'steak' as FoodId, emoji: '🥩', label: 'Стейк', amount: 60 },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="floating-shapes">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <video
        className="hidden"
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
      >
        <source src="/eating.mov" type="video/quicktime" />
        <source src="/eating.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-lg">
        <div
          className="pet-card relative overflow-hidden p-8 md:p-10 min-h-[620px] md:min-h-[700px] flex flex-col"
          style={{
            backgroundImage: "url('/images/kitchen.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <GlobalCoinsOverlay />
          <Link
            href="/"
            className="liquid-glass-btn absolute top-4 left-4 z-20 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border border-white/40 text-white hover:bg-white/30 transition-colors"
            aria-label="На главную"
            title="На главную"
          >
            <Home size={20} />
          </Link>

          <div className="relative z-10 mt-12 rounded-2xl bg-black/45 border border-white/20 p-4 backdrop-blur-sm">
            <h1 className="text-center text-2xl font-bold text-white mb-3">Кухня</h1>
            <div className="flex items-center justify-between mb-2 text-white font-semibold">
              <span>Сытость</span>
              <span>{satiety}%</span>
            </div>
            <div className="h-3 rounded-full bg-black/35 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${satiety}%`,
                  background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #22c55e 100%)',
                }}
              />
            </div>
          </div>

          <div className="mt-auto relative z-10 grid grid-cols-3 gap-3">
            {foods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => feedBy(food.id, food.amount)}
                disabled={loading || inventory[food.id] <= 0}
                className={`rounded-xl px-3 py-3 border text-white font-semibold disabled:cursor-not-allowed transition-colors ${
                  inventory[food.id] > 0
                    ? 'bg-black/45 border-white/25 hover:bg-black/60'
                    : 'bg-gray-500/45 border-gray-300/30 grayscale opacity-70'
                }`}
              >
                <div className="text-2xl">{food.emoji}</div>
                <div className="text-sm mt-1">{food.label}</div>
                <div className="text-xs text-emerald-200">+{food.amount}</div>
                <div className="text-xs mt-1 text-white/90">x{inventory[food.id]}</div>
              </button>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-0 flex justify-center pointer-events-none">
            <LocationPetDisplay
              externalAnimationSrc="/eating.mov"
              externalAnimationKey={eatingAnimationKey}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
