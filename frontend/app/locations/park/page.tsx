import Link from 'next/link';

export default function ParkLocationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="pet-card p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Парк</h1>
        <p className="text-gray-600 mb-6">Здесь питомец отдыхает и поднимает настроение.</p>
        <Link href="/" className="inline-flex px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
          Вернуться к питомцу
        </Link>
      </div>
    </main>
  );
}
