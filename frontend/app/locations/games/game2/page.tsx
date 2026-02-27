'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { petAPI } from '@/lib/api';

type Pipe = { x: number; topH: number; passed: boolean };

const WIDTH = 760;
const HEIGHT = 420;
const GAP = 130;

export default function Game2Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let gameOver = false;
    let rewarded = false;

    const bird = { x: 160, y: 180, vy: 0, r: 16 };
    const pipes: Pipe[] = [];
    let tick = 0;
    let points = 0;

    const rewardPet = async () => {
      if (rewarded || points < 1) return;
      rewarded = true;
      try {
        await petAPI.playPet();
      } catch (error) {
        console.error('Ошибка начисления настроения:', error);
      }
    };

    const flap = () => {
      if (gameOver) return;
      bird.vy = -8.2;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };

    const onClick = () => flap();

    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('click', onClick);

    const loop = () => {
      tick += 1;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      if (!gameOver) {
        bird.vy += 0.45;
        bird.y += bird.vy;

        if (tick % 95 === 0) {
          const topH = 60 + Math.floor(Math.random() * 180);
          pipes.push({ x: WIDTH + 40, topH, passed: false });
        }

        for (let i = pipes.length - 1; i >= 0; i -= 1) {
          pipes[i].x -= 3.5;
          if (pipes[i].x < -80) pipes.splice(i, 1);
        }
      }

      ctx.fillStyle = '#16a34a';
      pipes.forEach((pipe) => {
        const bottomY = pipe.topH + GAP;
        ctx.fillRect(pipe.x, 0, 62, pipe.topH);
        ctx.fillRect(pipe.x, bottomY, 62, HEIGHT - bottomY);

        if (!pipe.passed && pipe.x + 62 < bird.x - bird.r) {
          pipe.passed = true;
          points += 1;
          setScore(points);
        }

        const hitTop =
          bird.x + bird.r > pipe.x &&
          bird.x - bird.r < pipe.x + 62 &&
          bird.y - bird.r < pipe.topH;

        const hitBottom =
          bird.x + bird.r > pipe.x &&
          bird.x - bird.r < pipe.x + 62 &&
          bird.y + bird.r > bottomY;

        if (!gameOver && (hitTop || hitBottom)) {
          gameOver = true;
          setRunning(false);
          void rewardPet();
        }
      });

      if (!gameOver && (bird.y - bird.r < 0 || bird.y + bird.r > HEIGHT)) {
        gameOver = true;
        setRunning(false);
        void rewardPet();
      }

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`Score: ${points}`, 16, 30);

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('Game Over', WIDTH / 2 - 95, HEIGHT / 2 - 8);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="floating-shapes"><div></div><div></div><div></div><div></div></div>
      <div className="relative z-10 w-full max-w-4xl">
        <div className="pet-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Flappy Bird (TS)</h1>
            <Link href="/locations/games" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
              <Home size={16} />
              Назад
            </Link>
          </div>
          <div className="mb-4 rounded-xl bg-black/85 border border-white/20 px-4 py-3">
            <p className="text-white text-sm md:text-base">
              Правила: управляй птицей пробелом/стрелкой вверх или кликом, пролетай между трубами
              и набирай как можно больше очков.
            </p>
          </div>
          <div className="relative">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full rounded-xl bg-white border border-gray-300" />
            {!running && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Попробовать еще раз
                </button>
              </div>
            )}
          </div>
          <div className="mt-3 rounded-xl bg-black/85 border border-white/20 px-4 py-3">
            <p className="text-white font-semibold">Счёт: {score} {running ? '' : '(попытка завершена)'}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
