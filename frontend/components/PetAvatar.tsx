'use client';

import React, { useEffect, useState } from 'react';
import { Pet } from '@/types';
import { getPetConditionText } from '@/lib/utils';
import { consumeLaughAnimation } from '@/lib/pet-animation';

interface PetAvatarProps {
  pet: Pet | null;
  isBadWeather?: boolean;
  showMeta?: boolean;
  externalAnimationSrc?: string;
  externalAnimationKey?: number;
}

export function PetAvatar({
  pet,
  isBadWeather = false,
  showMeta = true,
  externalAnimationSrc,
  externalAnimationKey,
}: PetAvatarProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentAnimationSrc, setCurrentAnimationSrc] = useState<'laugh' | string>('laugh');
  const [animationVersion, setAnimationVersion] = useState(0);

  useEffect(() => {
    const remainingMs = consumeLaughAnimation();
    if (remainingMs <= 0) return;

    setCurrentAnimationSrc('laugh');
    setShowAnimation(true);
    setAnimationVersion((prev) => prev + 1);
    const timer = window.setTimeout(() => {
      setShowAnimation(false);
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!externalAnimationSrc || !externalAnimationKey) return;

    setCurrentAnimationSrc(externalAnimationSrc);
    setShowAnimation(true);
    setAnimationVersion((prev) => prev + 1);

    const fallbackTimer = window.setTimeout(() => {
      setShowAnimation(false);
    }, 8000);

    return () => window.clearTimeout(fallbackTimer);
  }, [externalAnimationSrc, externalAnimationKey]);

  if (!pet) {
    return (
      <div className="text-center">
        <div className="text-8xl mb-6 text-gray-300">🐾</div>
        <p className="text-gray-500 font-semibold">Нет питомца</p>
      </div>
    );
  }

  const isDead = pet.status.toLowerCase() === 'dead';
  const weatherMakesSad = isBadWeather && !isDead;
  const conditionText = weatherMakesSad ? 'Грустный из-за плохой погоды' : getPetConditionText(pet);
  const avatarSizeClass = 'w-[clamp(220px,50vh,520px)] h-[clamp(220px,50vh,520px)]';
  const avatarClass = weatherMakesSad
    ? `${avatarSizeClass} mx-auto rounded-full object-cover grayscale brightness-75 transition-all duration-300 hover:scale-105 cursor-pointer drop-shadow-lg`
    : `${avatarSizeClass} mx-auto rounded-full object-cover transition-all duration-300 hover:scale-105 cursor-pointer drop-shadow-lg`;

  return (
    <div className="text-center">
      {showMeta && <h2 className="-mt-10 md:-mt-14 mb-2 text-3xl font-bold text-gray-800">{pet.name}</h2>}
      <div className="relative inline-block">
        {showAnimation ? (
          <video
            key={animationVersion}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/skin/image.png"
            className={avatarClass}
            onEnded={() => setShowAnimation(false)}
          >
            {currentAnimationSrc === 'laugh' ? (
              <>
                <source src="/laught.mov" type="video/quicktime" />
                <source src="/laught.mp4" type="video/mp4" />
              </>
            ) : (
              <source
                src={currentAnimationSrc}
                type={currentAnimationSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}
              />
            )}
          </video>
        ) : (
          <img
            src="/skin/image.png"
            alt={`Аватар питомца ${pet.name}`}
            className={avatarClass}
          />
        )}
        {showMeta && (
          <div className="pet-status pet-status-bubble">
            {conditionText}
          </div>
        )}
      </div>
    </div>
  );
}
