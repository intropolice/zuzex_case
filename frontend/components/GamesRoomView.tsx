'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { petAPI } from '@/lib/api';
import { LocationPetDisplay } from '@/components/LocationPetDisplay';
import { GlobalCoinsOverlay } from '@/components/GlobalCoinsOverlay';

interface GamesRoomViewProps {
  title: string;
  backgroundImage: string;
}

export function GamesRoomView({ title, backgroundImage }: GamesRoomViewProps) {
  const [progress, setProgress] = useState(50);

  const routeButtons = [
    { label: 'Google Dinosaur', href: '/locations/games/game1' },
    { label: 'FlappyBird', href: '/locations/games/game2' },
    { label: 'Tetris', href: '/locations/games/game3' },
  ];

  useEffect(() => {
    let mounted = true;

    const syncMood = async () => {
      try {
        const pet = await petAPI.getPet();
        if (mounted) {
          const moodValue = Math.round(pet?.mood ?? 50);
          setProgress(Math.max(0, Math.min(100, moodValue)));
        }
      } catch (error) {
        console.error('Ошибка синхронизации настроения:', error);
      }
    };

    syncMood();
    const interval = setInterval(syncMood, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(99, 102, 241) 50%, rgb(59, 130, 246) 100%)',
        }}
      />
      <div className="absolute top-[14%] left-[12%] w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute bottom-[18%] right-[12%] w-44 h-44 rounded-full bg-white/10" />
      <div className="absolute bottom-[10%] left-[30%] w-36 h-36 rounded-full bg-white/10" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="pet-card relative overflow-hidden p-8 md:p-10 min-h-[620px] md:min-h-[700px] flex flex-col justify-between">
          <GlobalCoinsOverlay />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          <Link
            href="/"
            className="liquid-glass-btn absolute top-4 left-4 z-20 inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/45 bg-white/18 text-white backdrop-blur-xl shadow-[0_10px_28px_rgba(56,189,248,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/28 transition-all duration-300"
            aria-label="Вернуться к питомцу"
            title="Вернуться к питомцу"
          >
            <Home size={20} />
          </Link>

          <div className="relative z-10 pt-4">
            <h1 className="text-4xl md:text-5xl font-black text-fuchsia-200 text-center tracking-wide mb-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
              {title}
            </h1>

            <div className="bg-gray-200 rounded-full p-2">
              <div className="h-4 rounded-full bg-gray-300 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #f0abfc 0%, #ec4899 45%, #c026d3 100%)',
                  }}
                />
              </div>
            </div>
            <p className="text-cyan-200 text-sm mt-2 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">Настроение: {progress}%</p>
          </div>

          <div className="relative z-10 space-y-4 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {routeButtons.map((btn) => (
                <Link
                  key={btn.label}
                  href={btn.href}
                  className="liquid-glass-btn relative overflow-hidden text-center rounded-2xl px-5 py-3 font-bold text-white border border-white/40 bg-white/15 backdrop-blur-xl shadow-[0_8px_30px_rgba(236,72,153,0.28),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/25 hover:border-white/60 transition-all duration-300"
                >
                  <span className="pointer-events-none absolute inset-x-4 top-1 h-4 rounded-full bg-white/35 blur-sm" />
                  {btn.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-0 flex justify-center pointer-events-none">
            <LocationPetDisplay />
          </div>
        </div>
      </div>
    </main>
  );
}
