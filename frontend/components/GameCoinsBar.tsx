'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coins, Store } from 'lucide-react';
import { getGameCoins, subscribeGameCoins } from '@/lib/game-coins';

interface GameCoinsBarProps {
  className?: string;
}

export function GameCoinsBar({ className = '' }: GameCoinsBarProps) {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    setCoins(getGameCoins());
    return subscribeGameCoins(setCoins);
  }, []);

  return (
    <div className={`liquid-glass-btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white ${className}`}>
      <Link
        href="/shop"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/45 bg-white/20 hover:bg-white/30 transition-colors"
        aria-label="Открыть магазин"
        title="Магазин"
      >
        <Store size={14} />
      </Link>
      <Coins size={16} />
      <span className="text-sm font-bold leading-none">{coins}</span>
    </div>
  );
}
