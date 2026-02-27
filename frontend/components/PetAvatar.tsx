'use client';

import React, { useEffect, useState } from 'react';
import { Pet } from '@/types';
import { getPetConditionText } from '@/lib/utils';
import { consumeLaughAnimation } from '@/lib/pet-animation';

interface PetAvatarProps {
  pet: Pet | null;
}

export function PetAvatar({ pet }: PetAvatarProps) {
  const [showLaughAnimation, setShowLaughAnimation] = useState(false);

  useEffect(() => {
    const remainingMs = consumeLaughAnimation();
    if (remainingMs <= 0) return;

    setShowLaughAnimation(true);
    const timer = window.setTimeout(() => {
      setShowLaughAnimation(false);
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, []);

  if (!pet) {
    return (
      <div className="text-center">
        <div className="text-8xl mb-6 text-gray-300">🐾</div>
        <p className="text-gray-500 font-semibold">Нет питомца</p>
      </div>
    );
  }

  const conditionText = getPetConditionText(pet);

  return (
    <div className="text-center">
      {showLaughAnimation ? (
        <video
          src="/laught.mp4"
          autoPlay
          muted
          playsInline
          className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full object-cover transition-all duration-300 hover:scale-110 cursor-pointer drop-shadow-lg"
          onEnded={() => setShowLaughAnimation(false)}
        />
      ) : (
        <img
          src="/skin/image.png"
          alt={`Аватар питомца ${pet.name}`}
          className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full object-cover transition-all duration-300 hover:scale-110 cursor-pointer drop-shadow-lg"
        />
      )}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{pet.name}</h2>
      <div className="pet-status">
        {conditionText}
      </div>
    </div>
  );
}
