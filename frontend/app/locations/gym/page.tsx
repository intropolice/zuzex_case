import Link from 'next/link';

export default function GymLocationPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="pet-card p-8 w-full max-w-lg min-h-[620px] md:min-h-[700px] text-center flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Тренировка</h1>
        <p className="text-gray-600 mb-6">Здесь питомец тренируется и набирается энергии.</p>
        <Link href="/" className="inline-flex px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
          Вернуться к питомцу
        </Link>
      </div>
    </main>
  );
}
