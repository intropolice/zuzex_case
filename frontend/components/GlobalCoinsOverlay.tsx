'use client';

import { GameCoinsBar } from '@/components/GameCoinsBar';

interface GlobalCoinsOverlayProps {
  className?: string;
}

export function GlobalCoinsOverlay({ className = '' }: GlobalCoinsOverlayProps) {
  return (
    <div className={`absolute top-4 right-4 z-30 ${className}`}>
      <GameCoinsBar />
    </div>
  );
}
