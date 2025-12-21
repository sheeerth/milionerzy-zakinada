'use client';

import { PRIZE_LEVELS } from '@/lib/questions';

interface PrizeLadderProps {
  currentRound: number;
  status: 'not_started' | 'in_progress' | 'won' | 'lost';
}

export default function PrizeLadder({ currentRound, status }: PrizeLadderProps) {
  const allLevels = [0, ...PRIZE_LEVELS];
  const safeHavens = [5, 10]; // Rounds 5 and 10 are safe havens

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-center">Progi Pieniężne</h3>
      <div className="space-y-2">
        {allLevels.map((prize, index) => {
          const round = index;
          const isCurrent = round === currentRound && status === 'in_progress';
          const isPassed = round < currentRound;
          const isSafeHaven = safeHavens.includes(round);
          const isFinalPrize = round === currentRound && (status === 'won' || status === 'lost');

          let bgColor = 'bg-gray-700';
          if (isCurrent) {
            bgColor = 'bg-yellow-600';
          } else if (isPassed) {
            bgColor = 'bg-green-600';
          } else if (isFinalPrize) {
            bgColor = status === 'won' ? 'bg-green-500' : 'bg-red-600';
          }

          return (
            <div
              key={index}
              className={`${bgColor} p-3 rounded flex justify-between items-center ${
                isCurrent ? 'ring-2 ring-white' : ''
              }`}
            >
              <span className="font-semibold">
                {round === 0 ? 'Start' : `Pytanie ${round}`}
                {isSafeHaven && round > 0 && (
                  <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">Bezpieczny próg</span>
                )}
              </span>
              <span className="font-bold text-lg">
                {prize === 0 ? '0 PLN' : `${prize.toLocaleString('pl-PL')} PLN`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

