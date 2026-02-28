'use client';

import React, { useEffect, useState } from 'react';
import { Pet } from '@/types';
import { getPetConditionText } from '@/lib/utils';
import { consumeLaughAnimation } from '@/lib/pet-animation';
import { CharacterSkin, getCharacterImageForPet, getCharacterSkinForPet } from '@/lib/character-skin';

const CHARACTER1_SLEEP_ANIMATION = '/e2e5f706-5e6a-4fe1-8b8f-3aa7650d45cb_GStory_1772248737544.mov';
const CHARACTER1_SAD_ANIMATION = '/5a185663_0e13_49d5_982b_1b6703579929_u1_f75f7c75_0d48_454a_a9e2.mov';
const CHARACTER2_SAD_ANIMATION = '/a11577aa-cd9c-4e69-98d1-e7bad85bd283_1772236660743_GStory_1772236909250.mov';
const CHARACTER2_JOY_ANIMATION = '/462166fe-b6d8-4131-9f1b-3bfd97faa473_1772233388314_GStory_1772233718306.mov';
const CHARACTER2_EAT_ANIMATION = '/2dd6633a-688d-47dd-961a-8e27f62e9d62_1772233986327_GStory_1772234385171.mov';

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
  const [characterImage, setCharacterImage] = useState(() => getCharacterImageForPet(pet?.id));
  const [characterSkin, setCharacterSkin] = useState<CharacterSkin>(() => getCharacterSkinForPet(pet?.id));

  useEffect(() => {
    const remainingMs = consumeLaughAnimation();
    if (remainingMs <= 0) return;

    setCurrentAnimationSrc(characterSkin === 'variant2' ? CHARACTER2_JOY_ANIMATION : 'laugh');
    setShowAnimation(true);
    setAnimationVersion((prev) => prev + 1);
    const timer = window.setTimeout(() => {
      setShowAnimation(false);
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, [characterSkin]);

  useEffect(() => {
    if (!externalAnimationSrc || !externalAnimationKey) return;

    const isSleepAnimation = externalAnimationSrc.endsWith('/sleep.mov') || externalAnimationSrc.endsWith('/sleep.mp4');
    const isEatingAnimation = externalAnimationSrc.endsWith('/eating.mov') || externalAnimationSrc.endsWith('/eating.mp4');
    const resolvedAnimationSrc =
      characterSkin === 'default' && isSleepAnimation
        ? CHARACTER1_SLEEP_ANIMATION
        : characterSkin === 'variant2' && isEatingAnimation
          ? CHARACTER2_EAT_ANIMATION
          : characterSkin === 'variant2' && isSleepAnimation
            ? CHARACTER2_JOY_ANIMATION
            : externalAnimationSrc;

    setCurrentAnimationSrc(resolvedAnimationSrc);
    setShowAnimation(true);
    setAnimationVersion((prev) => prev + 1);

    const fallbackTimer = window.setTimeout(() => {
      setShowAnimation(false);
    }, 8000);

    return () => window.clearTimeout(fallbackTimer);
  }, [characterSkin, externalAnimationKey, externalAnimationSrc]);

  useEffect(() => {
    setCharacterImage(getCharacterImageForPet(pet?.id));
    setCharacterSkin(getCharacterSkinForPet(pet?.id));
  }, [pet?.id]);

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
  const isHungry = pet.hunger < 35;
  const isLowEnergy = pet.energy < 35;
  const isSick = pet.status.toLowerCase() === 'sick' || pet.health < 40;
  const shouldShowNeedsSadAnimation = !showAnimation && !isDead && (isHungry || isLowEnergy || isSick);
  const sadAnimationSrc = characterSkin === 'variant2' ? CHARACTER2_SAD_ANIMATION : CHARACTER1_SAD_ANIMATION;
  const conditionText = weatherMakesSad ? 'Грустный из-за плохой погоды' : getPetConditionText(pet);
  const avatarSizeClass = 'w-[clamp(220px,50vh,520px)] h-[clamp(220px,50vh,520px)]';
  const avatarClass = weatherMakesSad
    ? `${avatarSizeClass} mx-auto rounded-full object-cover grayscale brightness-75 transition-all duration-300 hover:scale-105 cursor-pointer drop-shadow-lg`
    : `${avatarSizeClass} mx-auto rounded-full object-cover transition-all duration-300 hover:scale-105 cursor-pointer drop-shadow-lg`;

  return (
    <div className="text-center">
      {showMeta && <h2 className="-mt-10 md:-mt-14 mb-2 text-3xl font-bold text-gray-800">{pet.name}</h2>}
      <div className="relative inline-block">
        <video className="hidden" preload="auto" muted playsInline aria-hidden="true">
          <source src={CHARACTER1_SLEEP_ANIMATION} type="video/quicktime" />
          <source src={CHARACTER1_SAD_ANIMATION} type="video/quicktime" />
          <source src={CHARACTER2_SAD_ANIMATION} type="video/quicktime" />
          <source src={CHARACTER2_JOY_ANIMATION} type="video/quicktime" />
          <source src={CHARACTER2_EAT_ANIMATION} type="video/quicktime" />
        </video>
        {showAnimation ? (
          <video
            key={animationVersion}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={characterImage}
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
        ) : shouldShowNeedsSadAnimation ? (
          <video
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            poster={characterImage}
            className={avatarClass}
          >
            <source src={sadAnimationSrc} type="video/quicktime" />
          </video>
        ) : (
          <img
            src={characterImage}
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
