'use client';

import React, { useState } from 'react';
import { GameProvider, useGame } from '@/context/GameContext';
import { GameDashboard } from '@/components/GameDashboard';
import { PetCreationForm } from '@/components/PetCreationForm';

function HomeContent() {
  const { pet } = useGame();
  const [petCreated, setPetCreated] = useState(!!pet);

  if (!petCreated && !pet) {
    return <PetCreationForm onCreated={() => setPetCreated(true)} />;
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
