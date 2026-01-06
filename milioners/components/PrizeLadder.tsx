'use client';

import { PRIZE_LEVELS } from '@/lib/questions';

interface PrizeLadderProps {
  currentRound: number;
  status: 'not_started' | 'intro' | 'in_progress' | 'won' | 'lost';
}

export default function PrizeLadder({ currentRound, status }: PrizeLadderProps) {
  const allLevels = [0, ...PRIZE_LEVELS];
  const safeHavens = [2, 7]; // Rounds 2 and 7 are safe havens

  return (
    <div className="bg-gradient-to-b from-[#000428] via-[#001a4d] to-[#000000] text-white p-6 rounded-xl shadow-2xl border-2 border-[#FFD700]">
      <h3 className="text-3xl font-black mb-6 text-center text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
        Progi Pieniężne
      </h3>
      <div className="space-y-3">
        {allLevels.map((prize, index) => {
          const round = index;
          const isCurrent = round === currentRound && status === 'in_progress';
          const isPassed = round < currentRound;
          const isSafeHaven = safeHavens.includes(round);
          const isFinalPrize = round === currentRound && (status === 'won' || status === 'lost');

          let bgColor = 'bg-gradient-to-r from-[#001a4d] to-[#000428] border-2 border-gray-700';
          let textColor = 'text-gray-300';
          
          if (isCurrent) {
            bgColor = 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-4 border-[#FFE55C] shadow-[0_0_30px_rgba(255,215,0,0.8)]';
            textColor = 'text-black';
          } else if (isPassed) {
            bgColor = 'bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-400';
            textColor = 'text-white';
          } else if (isFinalPrize) {
            bgColor = status === 'won' 
              ? 'bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.8)]'
              : 'bg-gradient-to-r from-red-600 to-red-500 border-2 border-red-400';
            textColor = 'text-white';
          }

          return (
            <div
              key={index}
              className={`${bgColor} ${textColor} p-4 rounded-lg flex justify-between items-center transition-all ${
                isCurrent ? 'pulse-gold scale-105' : ''
              }`}
            >
              <span className="font-black text-lg">
                {round === 0 ? 'START' : `PYTANIE ${round}`}
                {isSafeHaven && round > 0 && (
                  <span className="ml-3 text-xs bg-[#FFD700] text-black px-3 py-1 rounded-full font-bold">BEZPIECZNY PRÓG</span>
                )}
              </span>
              <span className="font-black text-xl md:text-2xl">
                {prize === 0 ? '0 PLN' : `${prize.toLocaleString('pl-PL')} PLN`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

