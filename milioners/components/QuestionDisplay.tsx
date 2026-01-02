'use client';

interface QuestionDisplayProps {
  question: string | null;
  round: number;
}

export default function QuestionDisplay({ question, round }: QuestionDisplayProps) {
  if (!question) {
    return (
      <div className="flex items-center justify-center h-64 text-3xl text-gray-400">
        Brak pytania
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] text-white p-12 rounded-xl shadow-2xl border-2 border-[#FFD700] relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent animate-pulse"></div>
      
      <div className="relative z-10 text-center">
        <div className="text-lg text-[#FFD700] mb-6 font-bold tracking-wider uppercase">
          Pytanie {round}
        </div>
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          {question}
        </h2>
      </div>
    </div>
  );
}

