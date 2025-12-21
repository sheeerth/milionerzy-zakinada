'use client';

interface QuestionDisplayProps {
  question: string | null;
  round: number;
}

export default function QuestionDisplay({ question, round }: QuestionDisplayProps) {
  if (!question) {
    return (
      <div className="flex items-center justify-center h-64 text-2xl text-gray-500">
        Brak pytania
      </div>
    );
  }

  return (
    <div className="bg-blue-900 text-white p-8 rounded-lg shadow-lg mb-6">
      <div className="text-sm text-blue-200 mb-4">Pytanie {round}</div>
      <h2 className="text-3xl font-bold leading-tight">{question}</h2>
    </div>
  );
}

