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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-center">Wyniki głosowania widowni</h3>
      <div className="space-y-4">
        {answers.map((answer, index) => {
          const votes = results[index] || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  {answerLabels[index]}: {answer}
                </span>
                <span className="text-lg font-bold">
                  {votes} głosów ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className={`${answerColors[index]} h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 0 && `${percentage}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Łącznie głosów: {totalVotes}
      </div>
    </div>
  );
}

