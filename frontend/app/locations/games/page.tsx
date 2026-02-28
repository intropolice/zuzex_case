'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { GlobalCoinsOverlay } from '@/components/GlobalCoinsOverlay';

export default function GamesLocationPage() {
  const rooms = [
    {
      label: 'Комната 1',
      subtitle: 'Классическая',
      href: '/locations/games/room1',
      preview: "url('/images/5323314.jpg')",
    },
    {
      label: 'Комната 2',
      subtitle: 'Неоновая',
      href: '/locations/games/room2',
      preview: "url('/images/5241342_preview.jpg')",
    },
  ];

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
        <div className="pet-card relative overflow-hidden p-8 md:p-10 min-h-[620px] md:min-h-[700px] flex flex-col">
          <GlobalCoinsOverlay />

          <Link
            href="/"
            className="liquid-glass-btn absolute top-4 left-4 z-20 inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/45 bg-white/18 text-white backdrop-blur-xl shadow-[0_10px_28px_rgba(56,189,248,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/28 transition-all duration-300"
            aria-label="Вернуться к питомцу"
            title="Вернуться к питомцу"
          >
            <Home size={20} />
          </Link>

          <div className="relative z-10 pt-16">
            <h1 className="text-4xl md:text-5xl font-black text-fuchsia-200 text-center tracking-wide mb-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
              Выбор Комнаты
            </h1>
          </div>

          <div className="relative z-10 mt-2 grid grid-cols-1 gap-4">
            {rooms.map((room) => (
              <Link
                key={room.label}
                href={room.href}
                className="relative overflow-hidden rounded-2xl border border-white/35 min-h-[150px] p-4 flex flex-col justify-end shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
                style={{
                  backgroundImage: `${room.preview}, linear-gradient(135deg, #312e81 0%, #7e22ce 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/25" />
                <div className="relative z-10">
                  <div className="text-white text-2xl font-extrabold drop-shadow">{room.label}</div>
                  <div className="text-white/90 text-sm font-semibold mt-1">{room.subtitle}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
