'use client';

import { useEffect, useMemo, useState } from 'react';
import { petAPI } from '@/lib/api';
import { triggerLaughAnimation } from '@/lib/pet-animation';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function ClinicLocationPage() {
  const [health, setHealth] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadHealth = async () => {
      try {
        const pet = await petAPI.getPet();
        if (!mounted) return;
        const value = Math.max(0, Math.min(100, Math.round(pet?.health ?? 60)));
        setHealth(value);
      } catch (error) {
        console.error('Ошибка загрузки здоровья:', error);
      }
    };

    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const diagnosis = useMemo(() => {
    if (health >= 85) return 'Диагноз: Отличное состояние';
    if (health >= 60) return 'Диагноз: Стабильное состояние';
    if (health >= 35) return 'Диагноз: Нужен уход';
    if (health > 0) return 'Диагноз: Требуется лечение';
    return 'Диагноз: Критическое состояние';
  }, [health]);

  const handleTreatment = async () => {
    setLoading(true);
    const previousHealth = health;
    try {
      const pet = await petAPI.healPet();
      const value = Math.max(0, Math.min(100, Math.round(pet?.health ?? previousHealth)));
      setHealth(value);
      if (value > previousHealth) {
        triggerLaughAnimation();
      }
    } catch (error) {
      console.error('Ошибка лечения питомца:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(99, 102, 241) 50%, rgb(59, 130, 246) 100%)',
      }}
    >
      <div className="w-full max-w-lg">
        <div
          className="pet-card relative overflow-hidden min-h-[780px]"
          style={{
            backgroundImage: "url('/images/clinic_bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Link
            href="/"
            className="absolute top-6 left-6 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/45 border border-white/30 text-white hover:bg-black/60 transition-colors shadow-lg backdrop-blur-sm"
            aria-label="На главную"
            title="На главную"
          >
            <Home size={18} />
          </Link>

          <div className="absolute inset-x-6 top-20 rounded-2xl bg-black/45 border border-white/20 p-4 backdrop-blur-sm">
            <h1 className="text-center text-2xl font-bold text-white mb-3">Клиника</h1>
            <div className="flex items-center justify-between mb-2 text-white font-semibold">
              <span>Здоровье</span>
              <span>{health}%</span>
            </div>
            <div className="h-3 rounded-full bg-black/35 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${health}%`,
                  background: 'linear-gradient(90deg, #ef4444 0%, #f97316 45%, #22c55e 100%)',
                }}
              />
            </div>
            <p className="mt-3 text-center text-white font-semibold">{diagnosis}</p>
          </div>

          <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center">
            <button
              type="button"
              onClick={handleTreatment}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Лечение...' : 'Начать лечение'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
