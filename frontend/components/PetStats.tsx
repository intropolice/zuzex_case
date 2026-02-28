'use client';

import React from 'react';
import { Pet } from '@/types';
import { Apple, HeartPulse, Smile, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PetStatsProps {
  pet: Pet | null;
}

export function PetStats({ pet }: PetStatsProps) {
  const router = useRouter();

  if (!pet) {
    return (
      <div className="text-center py-8 text-gray-500">
        Загрузка данных питомца...
      </div>
    );
  }

  const stats = [
    {
      label: 'Кухня',
      value: Math.round(100 - (pet?.hunger ?? 50)),
      icon: Apple,
      href: '/locations/kitchen',
    },
    {
      label: 'Спальня',
      value: Math.round(pet?.energy ?? 100),
      icon: Zap,
      href: '/locations/sleep',
    },
    {
      label: 'Игровая',
      value: Math.round(pet?.mood ?? 50),
      icon: Smile,
      href: '/locations/games',
    },
    {
      label: 'Больница',
      value: Math.round(pet?.health ?? 100),
      icon: HeartPulse,
      href: '/locations/clinic',
    },
  ];

  const getStatusColor = (percentage: number) => {
    const safe = Math.min(Math.max(percentage, 0), 100);
    const hue = (safe / 100) * 120;
    return `hsl(${hue}, 80%, 45%)`;
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const percentage = Math.min(Math.max(stat.value, 0), 100);
        const color = getStatusColor(percentage);

        return (
          <button
            key={stat.label}
            type="button"
            onClick={() => router.push(stat.href)}
            className="main-menu-stat-btn flex flex-col items-center gap-1 focus:outline-none"
            aria-label={`Перейти в локацию для показателя "${stat.label}"`}
            title={`Открыть локацию: ${stat.label}`}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105"
              style={{
                background: `conic-gradient(${color} ${percentage * 3.6}deg, #e5e7eb 0deg)`,
              }}
            >
              <div className="w-11 h-11 rounded-full bg-white flex flex-col items-center justify-center">
                <Icon size={12} style={{ color }} />
                <span className="text-[10px] font-semibold text-gray-700 leading-none mt-0.5">
                  {percentage}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-700">
              {stat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
