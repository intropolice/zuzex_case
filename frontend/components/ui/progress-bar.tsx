import React from 'react';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, max = 100, className, color = 'bg-gradient-to-r from-blue-500 to-blue-400' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const getBarColor = () => {
    if (color.includes('hunger')) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    if (color.includes('energy')) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    if (color.includes('mood')) return 'bg-gradient-to-r from-pink-500 to-pink-400';
    return color;
  };

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden", className)}>
      <div
        className={cn("h-3 rounded-full transition-all duration-300 ease-out shadow-md", getBarColor())}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

