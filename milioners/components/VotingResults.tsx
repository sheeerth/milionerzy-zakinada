'use client';

interface VotingResultsProps {
  results: { [key: number]: number } | null;
  answers: string[];
}

const answerLabels = ['A', 'B', 'C', 'D'];
const answerColors = ['bg-blue-600', 'bg-green-600', 'bg-yellow-600', 'bg-red-600'];

export default function VotingResults({ results, answers }: VotingResultsProps) {
  if (!results) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-gray-600">Brak wyników głosowania</p>
      </div>
    );
  }

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] p-8 rounded-xl shadow-2xl border-2 border-[#FFD700]">
      <h3 className="text-3xl font-black mb-6 text-center text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Wyniki głosowania widowni</h3>
      <div className="space-y-6">
        {answers.map((answer, index) => {
          const votes = results[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          return (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-xl text-white">
                  <span className="text-[#FFD700] text-2xl mr-3">{answerLabels[index]}:</span> {answer}
                </span>
                <span className="text-xl font-black text-[#FFD700]">
                  {votes} głosów ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-8 border-2 border-gray-700">
                <div
                  className={`${answerColors[index]} h-8 rounded-full flex items-center justify-center text-white text-lg font-black transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 0 && `${percentage}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-center text-xl font-black text-[#FFD700]">
        Łącznie głosów: {totalVotes}
      </div>
    </div>
  );
}

