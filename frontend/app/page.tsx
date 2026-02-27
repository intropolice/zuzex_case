'use client';

import React from 'react';
import { GameProvider, useGame } from '@/context/GameContext';
import { GameDashboard } from '@/components/GameDashboard';
import { PetCreationForm } from '@/components/PetCreationForm';

function HomeContent() {
  const { pet, petInitialized, loading } = useGame();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="white-card px-6 py-4 text-gray-700 font-semibold">Загрузка питомца...</div>
      </div>
    );
  }

  // Показываем форму создания питомца пока он не инициализирован
  // или если текущий питомец умер.
  if (!petInitialized || pet?.status?.toLowerCase() === 'dead') {
    return <PetCreationForm onCreated={() => {}} />;
  }

  return <GameDashboard />;
}

export default function Home() {
  return (
    <GameProvider>
      <HomeContent />
    </GameProvider>
  );
}
