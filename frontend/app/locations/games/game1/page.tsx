'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { petAPI } from '@/lib/api';
import { addGameCoins } from '@/lib/game-coins';
import { GameCoinsBar } from '@/components/GameCoinsBar';

type Obstacle = { x: number; width: number; height: number };

const WIDTH = 760;
const HEIGHT = 360;
const GROUND_Y = 300;

export default function Game1Page() {
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

    const dino = {
      x: 70,
      y: GROUND_Y - 42,
      w: 34,
      h: 42,
      vy: 0,
      onGround: true,
    };

    let speed = 6;
    let frameScore = 0;
    let spawnTimer = 0;
    const obstacles: Obstacle[] = [];

    const rewardPet = async () => {
      if (rewarded || frameScore < 10) return;
      rewarded = true;
      try {
        await petAPI.playPet();
      } catch (error) {
        console.error('Ошибка начисления настроения:', error);
      }
    };

    const jump = () => {
      if (gameOver) return;
      if (dino.onGround) {
        dino.vy = -12;
        dino.onGround = false;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const onClick = () => jump();

    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('click', onClick);

    const loop = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#a3a3a3';
      ctx.fillRect(0, GROUND_Y, WIDTH, 2);

      if (!gameOver) {
        dino.vy += 0.7;
        dino.y += dino.vy;

        if (dino.y >= GROUND_Y - dino.h) {
          dino.y = GROUND_Y - dino.h;
          dino.vy = 0;
          dino.onGround = true;
        }

        spawnTimer -= 1;
        if (spawnTimer <= 0) {
          const height = 26 + Math.floor(Math.random() * 34);
          const width = 18 + Math.floor(Math.random() * 20);
          obstacles.push({ x: WIDTH + width, width, height });
          spawnTimer = 55 + Math.floor(Math.random() * 45);
        }

        for (let i = obstacles.length - 1; i >= 0; i -= 1) {
          obstacles[i].x -= speed;
          if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            frameScore += 1;
            addGameCoins(1);
            if (frameScore % 5 === 0) speed += 0.3;
            setScore(frameScore);
          }
        }
      }

      // Blocky dinosaur model
      ctx.fillStyle = '#065f46';
      ctx.fillRect(dino.x + 8, dino.y + 10, 18, 20); // body
      ctx.fillRect(dino.x + 16, dino.y, 12, 12); // head
      ctx.fillRect(dino.x + 8, dino.y + 30, 6, 12); // left leg
      ctx.fillRect(dino.x + 20, dino.y + 30, 6, 12); // right leg
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(dino.x + 23, dino.y + 4, 3, 3); // eye

      ctx.fillStyle = '#15803d';
      obstacles.forEach((o) => {
        const oy = GROUND_Y - o.height;
        // Cactus-like primitive obstacle
        const trunkW = Math.max(10, Math.floor(o.width * 0.6));
        const armW = Math.max(4, Math.floor(o.width * 0.25));
        ctx.fillRect(o.x, oy, trunkW, o.height);
        ctx.fillRect(o.x - armW + 1, oy + Math.floor(o.height * 0.45), armW, Math.max(8, Math.floor(o.height * 0.22)));
        ctx.fillRect(o.x + trunkW - 1, oy + Math.floor(o.height * 0.28), armW, Math.max(8, Math.floor(o.height * 0.2)));

        const hit =
          dino.x < o.x + o.width &&
          dino.x + dino.w > o.x &&
          dino.y < oy + o.height &&
          dino.y + dino.h > oy;

        if (!gameOver && hit) {
          gameOver = true;
          setRunning(false);
          void rewardPet();
        }
      });

      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Score: ${frameScore}`, 16, 28);

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('Game Over', WIDTH / 2 - 95, HEIGHT / 2 - 10);
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
        <div className="pet-card relative overflow-hidden p-6 md:p-8">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/images/main_bg1.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dino Runner (TS)</h1>
            <div className="flex items-center gap-2">
              <GameCoinsBar />
              <Link href="/locations/games" className="liquid-glass-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/45 bg-white/16 text-white backdrop-blur-xl shadow-[0_10px_26px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/26 transition-all duration-300">
                <Home size={16} />
                Назад
              </Link>
            </div>
          </div>
          <div className="relative z-10 mb-4 rounded-xl bg-black/85 border border-white/20 px-4 py-3">
            <p className="text-white text-sm md:text-base">
              Правила: избегай препятствий, прыгай на пробел/стрелку вверх или кликом по полю.
              Чем дольше бежишь, тем выше счёт.
            </p>
          </div>
          <div className="relative z-10">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full rounded-xl bg-white border border-gray-300" />
            {!running && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex px-5 py-3 rounded-xl border border-white/45 bg-white/16 text-white font-semibold backdrop-blur-xl shadow-[0_10px_26px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/26 transition-all duration-300"
                >
                  Попробовать еще раз
                </button>
              </div>
            )}
          </div>
          <div className="relative z-10 mt-3 rounded-xl bg-black/85 border border-white/20 px-4 py-3">
            <p className="text-white font-semibold">Счёт: {score} {running ? '' : '(забег завершён)'}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
