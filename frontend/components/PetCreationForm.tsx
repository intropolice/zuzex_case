'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { CharacterSkin, saveCharacterSkin } from '@/lib/character-skin';

interface PetCreationFormProps {
  onCreated: () => void;
}

export function PetCreationForm({ onCreated }: PetCreationFormProps) {
  const [petName, setPetName] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<CharacterSkin>('default');
  const [loading, setLoading] = useState(false);
  const { initializePet, error } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;

    setLoading(true);
    try {
      const createdPet = await initializePet(petName);
      saveCharacterSkin(createdPet.id, selectedSkin);
      onCreated();
    } catch (error) {
      console.error('Ошибка при создании питомца:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Плавающие фигуры */}
      <div className="floating-shapes">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Контент */}
      <div className="relative z-10 w-full max-w-md">
        <div className="white-card p-8 md:p-10 animate-float">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🐾 Создай питомца 🐾
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Дай ему имя и начни приключение!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="petName"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Имя питомца
              </label>
              <input
                id="petName"
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Введи имя (например, Шарик)"
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-600 focus:outline-none transition-colors text-gray-800"
                disabled={loading}
              />
            </div>

            <div>
              <p className="block text-sm font-semibold text-gray-800 mb-2">Выбор персонажа</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSkin('default')}
                  className={`rounded-xl border-2 p-2 transition-colors ${selectedSkin === 'default' ? 'border-purple-600' : 'border-purple-300'}`}
                  disabled={loading}
                >
                  <img
                    src="/skin/image.png"
                    alt="Персонаж 1"
                    className="w-full h-24 object-contain rounded-lg bg-white"
                  />
                  <span className="mt-1 block text-xs font-semibold text-gray-700">Персонаж 1</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSkin('variant2')}
                  className={`rounded-xl border-2 p-2 transition-colors ${selectedSkin === 'variant2' ? 'border-purple-600' : 'border-purple-300'}`}
                  disabled={loading}
                >
                  <img
                    src="/images/Image-2.png"
                    alt="Персонаж 2"
                    className="w-full h-24 object-contain rounded-lg bg-white"
                  />
                  <span className="mt-1 block text-xs font-semibold text-gray-700">Персонаж 2</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!petName.trim() || loading}
              className="w-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {loading ? 'Создание...' : 'Создать питомца'}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 text-center font-medium">
              {error}
            </p>
          )}

          <div className="info-box mt-6">
            <p className="info-text">
              ✨ Твой питомец будет нуждаться в уходе каждый день!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
