'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pet } from '@/types';
import { petAPI } from '@/lib/api';

interface GameContextType {
  pet: Pet | null;
  loading: boolean;
  error: string | null;
  petInitialized: boolean;
  initializePet: (name: string) => Promise<void>;
  refreshPet: () => Promise<void>;
  updatePet: (pet: Pet) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [petInitialized, setPetInitialized] = useState(false);

  const isValidPetResponse = (value: unknown): value is Pet => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return !candidate.error && typeof candidate.id === 'string' && typeof candidate.name === 'string';
  };

  const initializePet = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedName = name.trim();
      console.log('[GameContext] Creating pet with name:', normalizedName);
      const newPet = await petAPI.createPet(normalizedName);
      if (!isValidPetResponse(newPet)) {
        throw new Error('Некорректный ответ сервера при создании питомца');
      }
      console.log('[GameContext] Pet created:', newPet);
      setPet(newPet);
      setPetInitialized(true);

      // Force-sync after creation so UI never stays in a stale "dead pet" state.
      const latestPet = await petAPI.getPet();
      if (isValidPetResponse(latestPet)) {
        setPet(latestPet);
        setPetInitialized(true);
      }

      console.log('[GameContext] Pet initialized successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при создании питомца';
      setError(message);
      console.error('[GameContext] Error creating pet:', err);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPet = async () => {
    try {
      const updatedPet = await petAPI.getPet();
      if (isValidPetResponse(updatedPet)) {
        setPet(updatedPet);
        setPetInitialized(true);
      } else {
        setPet(null);
        setPetInitialized(false);
      }
    } catch (err) {
      console.error('Ошибка при обновлении питомца:', err);
      setPet(null);
      setPetInitialized(false);
    }
  };

  useEffect(() => {
    const loadPetOnStart = async () => {
      try {
        const existingPet = await petAPI.getPet();
        if (isValidPetResponse(existingPet)) {
          setPet(existingPet);
          setPetInitialized(true);
        } else {
          setPet(null);
          setPetInitialized(false);
        }
      } catch (err) {
        setPet(null);
        setPetInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    loadPetOnStart();
  }, []);

  // Обновлять питомца каждые 30 секунд только если он инициализирован
  useEffect(() => {
    if (!petInitialized) return;
    const interval = setInterval(refreshPet, 30000);
    return () => clearInterval(interval);
  }, [petInitialized]);

  const updatePet = (updatedPet: Pet) => {
    setPet(updatedPet);
  };

  return (
    <GameContext.Provider value={{ pet, loading, error, petInitialized, initializePet, refreshPet, updatePet }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame должен использоваться внутри GameProvider');
  }
  return context;
}
