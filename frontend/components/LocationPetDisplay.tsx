'use client';

import { useEffect, useState } from 'react';
import { petAPI } from '@/lib/api';
import { Pet } from '@/types';
import { PetAvatar } from './PetAvatar';

interface LocationPetDisplayProps {
  className?: string;
  externalAnimationSrc?: string;
  externalAnimationKey?: number;
}

export function LocationPetDisplay({
  className = '',
  externalAnimationSrc,
  externalAnimationKey,
}: LocationPetDisplayProps) {
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPet = async () => {
      try {
        const nextPet = await petAPI.getPet();
        if (!mounted) return;
        setPet(nextPet);
      } catch (error) {
        console.error('Ошибка загрузки питомца:', error);
      }
    };

    void loadPet();
    const interval = window.setInterval(() => {
      void loadPet();
    }, 15000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!pet) return null;

  return (
    <div className={`-translate-y-[70px] ${className}`}>
      <PetAvatar
        pet={pet}
        showMeta={false}
        externalAnimationSrc={externalAnimationSrc}
        externalAnimationKey={externalAnimationKey}
      />
    </div>
  );
}
