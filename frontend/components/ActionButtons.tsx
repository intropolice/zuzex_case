'use client';

import React from 'react';
import { Apple, Gamepad2, Moon, Heart } from 'lucide-react';

interface ActionButtonsProps {
  onFeed: () => Promise<void>;
  onPlay: () => Promise<void>;
  onSleep: () => Promise<void>;
  onHeal: () => Promise<void>;
  loading?: boolean;
}

export function ActionButtons({
  onFeed,
  onPlay,
  onSleep,
  onHeal,
  loading = false,
}: ActionButtonsProps) {
  const handleClick = async (callback: () => Promise<void>, actionName: string) => {
    console.log(`[${actionName}] Кнопка нажата`);
    try {
      await callback();
      console.log(`[${actionName}] Успешно выполнено`);
    } catch (error) {
      console.error(`[${actionName}] Ошибка:`, error);
    }
  };

  const actions = [
    {
      label: 'Покормить',
      shortLabel: 'Еда',
      onClick: () => handleClick(onFeed, 'FEED'),
      icon: Apple,
      className: 'btn-feed',
    },
    {
      label: 'Поиграть',
      shortLabel: 'Игра',
      onClick: () => handleClick(onPlay, 'PLAY'),
      icon: Gamepad2,
      className: 'btn-play',
    },
    {
      label: 'Спать',
      shortLabel: 'Сон',
      onClick: () => handleClick(onSleep, 'SLEEP'),
      icon: Moon,
      className: 'btn-sleep',
    },
    {
      label: 'Лечить',
      shortLabel: 'Лечение',
      onClick: () => handleClick(onHeal, 'HEAL'),
      icon: Heart,
      className: 'btn-heal',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={loading}
            className={`action-button ${action.className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={action.label}
            title={action.label}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden text-sm">{action.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
