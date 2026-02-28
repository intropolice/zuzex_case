'use client';

import Link from 'next/link';
import { Home, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { petAPI } from '@/lib/api';
import { triggerLaughAnimation } from '@/lib/pet-animation';
import { LocationPetDisplay } from '@/components/LocationPetDisplay';
import { GlobalCoinsOverlay } from '@/components/GlobalCoinsOverlay';

export default function SleepLocationPage() {
  const [energy, setEnergy] = useState(100);
  const [loading, setLoading] = useState(false);
  const [sleepAnimationKey, setSleepAnimationKey] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const tiredness = Math.max(0, Math.min(100, energy));

  const loadPet = async () => {
    try {
      const pet = await petAPI.getPet();
      const value = Math.max(0, Math.min(100, Math.round(pet?.energy ?? 100)));
      setEnergy(value);
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

  useEffect(() => {
    if (cooldownUntil <= 0) return;

    const updateCooldown = () => {
      const remainingMs = cooldownUntil - Date.now();
      if (remainingMs <= 0) {
        setCooldownLeft(0);
        setCooldownUntil(0);
        return;
      }
      setCooldownLeft(Math.ceil(remainingMs / 1000));
    };

    updateCooldown();
    const interval = window.setInterval(updateCooldown, 200);

    return () => window.clearInterval(interval);
  }, [cooldownUntil]);

  const handleSleep = async () => {
    if (loading || cooldownLeft > 0) return;

    setSleepAnimationKey((prev) => prev + 1);
    setLoading(true);
    const previousEnergy = energy;
    try {
      const updatedPet = await petAPI.sleepPet();
      const nextEnergy = Math.max(0, Math.min(100, Math.round(updatedPet?.energy ?? previousEnergy)));
      setEnergy(nextEnergy);
      if (nextEnergy > previousEnergy) {
        triggerLaughAnimation();
      }
    } catch (error) {
      console.error('Ошибка сна питомца:', error);
    } finally {
      setLoading(false);
      setCooldownUntil(Date.now() + 5000);
    }
  };

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
        <source src="/sleep.mov" type="video/quicktime" />
        <source src="/sleep.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-lg">
        <div
          className="pet-card relative overflow-hidden p-8 md:p-10 min-h-[620px] md:min-h-[700px] flex flex-col"
          style={{
            backgroundImage: "url('/images/2039.jpg')",
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
            <div className="flex items-center justify-between mb-2 text-white font-semibold">
              <span>Энергия</span>
              <span>{tiredness}%</span>
            </div>
            <div className="h-3 rounded-full bg-black/35 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${tiredness}%`,
                  background: 'linear-gradient(90deg, #22c55e 0%, #eab308 45%, #ef4444 100%)',
                }}
              />
            </div>
          </div>

          <div className="mt-auto relative z-10 flex justify-center">
            <button
              type="button"
              onClick={handleSleep}
              disabled={loading || cooldownLeft > 0}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Moon size={18} />
              {loading ? 'Сплю...' : cooldownLeft > 0 ? `Кулдаун: ${cooldownLeft}с` : 'Спать'}
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-0 flex justify-center pointer-events-none">
            <LocationPetDisplay
              externalAnimationSrc="/sleep.mov"
              externalAnimationKey={sleepAnimationKey}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
