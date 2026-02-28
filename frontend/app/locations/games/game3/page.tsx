'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { petAPI } from '@/lib/api';
import { addGameCoins } from '@/lib/game-coins';
import { GameCoinsBar } from '@/components/GameCoinsBar';

type Cell = number;
type Matrix = Cell[][];
type Piece = { shape: Matrix; x: number; y: number; color: string };

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;
const WIDTH = COLS * BLOCK;
const HEIGHT = ROWS * BLOCK;

const SHAPES: Matrix[] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
];

const COLORS = ['#22c55e', '#eab308', '#a855f7', '#06b6d4', '#ef4444', '#f97316', '#3b82f6'];

const rotate = (m: Matrix): Matrix => m[0].map((_, i) => m.map((row) => row[i]).reverse());

const makeGrid = (): Matrix => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 0));

export default function Game3Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(true);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let gameOver = false;
    let rewarded = false;
    let dropAcc = 0;
    let lastTime = 0;
    let totalLines = 0;
    let dropDelay = 520;

    const grid = makeGrid();

    const makePiece = (): Piece => {
      const idx = Math.floor(Math.random() * SHAPES.length);
      const shape = SHAPES[idx].map((row) => [...row]);
      return {
        shape,
        x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
        y: 0,
        color: COLORS[idx],
      };
    };

    let current = makePiece();

    const collides = (piece: Piece): boolean => {
      for (let y = 0; y < piece.shape.length; y += 1) {
        for (let x = 0; x < piece.shape[y].length; x += 1) {
          if (!piece.shape[y][x]) continue;
          const nx = piece.x + x;
          const ny = piece.y + y;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && grid[ny][nx]) return true;
        }
      }
      return false;
    };

    const merge = () => {
      for (let y = 0; y < current.shape.length; y += 1) {
        for (let x = 0; x < current.shape[y].length; x += 1) {
          if (!current.shape[y][x]) continue;
          const gy = current.y + y;
          const gx = current.x + x;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            grid[gy][gx] = COLORS.indexOf(current.color) + 1;
          }
        }
      }
    };

    const rewardPet = async () => {
      if (rewarded || totalLines < 2) return;
      rewarded = true;
      try {
        await petAPI.playPet();
      } catch (error) {
        console.error('Ошибка начисления настроения:', error);
      }
    };

    const clearLines = () => {
      let cleared = 0;
      for (let y = ROWS - 1; y >= 0; y -= 1) {
        if (grid[y].every((c) => c > 0)) {
          grid.splice(y, 1);
          grid.unshift(Array.from({ length: COLS }, () => 0));
          cleared += 1;
          y += 1;
        }
      }
      if (cleared > 0) {
        addGameCoins(cleared * 5);
        totalLines += cleared;
        const nextLevel = 1 + Math.floor(totalLines / 4);
        dropDelay = Math.max(120, 560 - nextLevel * 45);
        setLines(totalLines);
        setLevel(nextLevel);
      }
    };

    const spawn = () => {
      current = makePiece();
      if (collides(current)) {
        gameOver = true;
        setRunning(false);
        void rewardPet();
      }
    };

    const stepDown = () => {
      current.y += 1;
      if (collides(current)) {
        current.y -= 1;
        merge();
        clearLines();
        spawn();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.code === 'ArrowLeft') {
        current.x -= 1;
        if (collides(current)) current.x += 1;
      }
      if (e.code === 'ArrowRight') {
        current.x += 1;
        if (collides(current)) current.x -= 1;
      }
      if (e.code === 'ArrowDown') {
        stepDown();
      }
      if (e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        const prev = current.shape;
        current.shape = rotate(current.shape);
        if (collides(current)) current.shape = prev;
      }
    };

    window.addEventListener('keydown', onKeyDown);

    const drawBlock = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x * BLOCK + 0.5, y * BLOCK + 0.5, BLOCK - 2, BLOCK - 2);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x * BLOCK + 3, y * BLOCK + 3, BLOCK - 12, BLOCK - 12);
    };

    const render = (ts: number) => {
      const delta = ts - lastTime;
      lastTime = ts;
      dropAcc += delta;

      if (!gameOver && dropAcc >= dropDelay) {
        dropAcc = 0;
        stepDown();
      }

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          if (grid[y][x] > 0) drawBlock(x, y, COLORS[grid[y][x] - 1]);
        }
      }

      current.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (!cell) return;
          const gx = current.x + x;
          const gy = current.y + y;
          if (gy >= 0) drawBlock(gx, gy, current.color);
        });
      });

      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText('Game Over', WIDTH / 2 - 85, HEIGHT / 2 - 6);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="floating-shapes"><div></div><div></div><div></div><div></div></div>
      <div className="relative z-10 w-full max-w-5xl">
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tetris (TS)</h1>
            <div className="flex items-center gap-2">
              <GameCoinsBar />
              <Link href="/locations/games" className="liquid-glass-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/45 bg-white/16 text-white backdrop-blur-xl shadow-[0_10px_26px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/26 transition-all duration-300">
                  <Home size={16} />
                  Назад
              </Link>
            </div>
          </div>

          <div className="relative z-10 grid md:grid-cols-[auto,1fr] gap-6 items-start">
            <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-xl border border-gray-300 bg-black" />
            <div className="space-y-4">
              <div className="rounded-xl bg-black/85 border border-white/20 px-4 py-3 text-white">
                <p className="mb-2">Правила:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Собирай заполненные горизонтальные линии.</li>
                  <li>Скорость растёт с уровнем.</li>
                  <li>Игра заканчивается, когда фигуры упираются в верх.</li>
                </ul>
              </div>
              <div className="rounded-xl bg-black/85 border border-white/20 px-4 py-3 text-white">
                <p className="font-semibold text-lg mb-1">Линии: {lines}</p>
                <p className="font-semibold text-lg mb-3">Уровень: {level}</p>
                <p className="mb-2">Управление:</p>
                <ul className="list-disc pl-5 space-y-1">
                <li>Влево/вправо: движение</li>
                <li>Вверх или пробел: поворот</li>
                <li>Вниз: ускорить падение</li>
                </ul>
                <p className="mt-4">После партии повышается настроение питомца, если очистил хотя бы 2 линии.</p>
                <p className="mt-2 font-semibold">Статус: {running ? 'Игра идёт' : 'Партия завершена'}</p>
              </div>
              {!running && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-flex px-5 py-3 rounded-xl border border-white/45 bg-white/16 text-white font-semibold backdrop-blur-xl shadow-[0_10px_26px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-white/26 transition-all duration-300"
                >
                  Попробовать еще раз
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
