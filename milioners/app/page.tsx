import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
      <main className="flex flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-5xl font-bold text-white mb-4 text-center">
          Milionerzy
        </h1>
        <p className="text-xl text-blue-100 mb-8 text-center max-w-md">
          Wybierz ekran, który chcesz otworzyć
        </p>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Link
            href="/game"
            className="flex h-16 items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl transition-colors shadow-lg transform hover:scale-105"
          >
            🎮 Ekran Gry
          </Link>
          <Link
            href="/host"
            className="flex h-16 items-center justify-center rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl transition-colors shadow-lg transform hover:scale-105"
          >
            🎤 Panel Prowadzącego
          </Link>
        </div>
      </main>
    </div>
  );
}
