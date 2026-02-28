'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { PetAvatar } from './PetAvatar';
import { PetStats } from './PetStats';
import { GlobalCoinsOverlay } from './GlobalCoinsOverlay';

type WeatherResponse = {
  city?: string;
  weatherDescription?: string;
  isBadWeather?: boolean;
};

export function GameDashboard() {
  const { pet } = useGame();
  const [isBadWeather, setIsBadWeather] = useState(false);
  const [weatherDescription, setWeatherDescription] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async (query = '') => {
      try {
        const response = await fetch(`/api/weather${query}`, { cache: 'no-store' });
        const data = (await response.json()) as WeatherResponse;

        if (cancelled) return;

        setIsBadWeather(Boolean(data.isBadWeather));
        setWeatherDescription(typeof data.weatherDescription === 'string' ? data.weatherDescription : '');
      } catch (error) {
        console.error('Ошибка загрузки погоды:', error);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          void loadWeather(`?lat=${latitude}&lon=${longitude}`);
        },
        () => {
          void loadWeather();
        },
        { timeout: 6000 },
      );
    } else {
      void loadWeather();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Плавающие фигуры */}
      <div className="floating-shapes">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Контент */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="pet-card relative overflow-hidden p-8 md:p-10 animate-float flex flex-col min-h-[620px] md:min-h-[700px]">
          <GlobalCoinsOverlay className="z-10" />
          {/* Заголовок */}
          <div className="relative z-20 text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              🐾 Цифровой Питомец 🐾
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Ухаживай за своим другом!
            </p>
            {weatherDescription && (
              <p className="text-xs md:text-sm mt-2 text-gray-700">
                Погода: {weatherDescription}
              </p>
            )}
          </div>

          {/* Кнопки справа от персонажа */}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20">
            <PetStats pet={pet} />
          </div>

          {/* Аватар питомца снизу, чтобы не перекрывать кнопки */}
          <div className="relative z-10 mt-auto flex justify-center items-end min-h-[46vh] pt-4">
            <PetAvatar pet={pet} isBadWeather={isBadWeather} />
          </div>

        </div>
      </div>

    </main>
  );
}
