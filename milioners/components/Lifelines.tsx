'use client';

import { LifelineType } from '@/lib/game-state';

interface LifelinesProps {
  usedLifelines: LifelineType[];
  onUseLifeline: (lifeline: LifelineType) => void;
  disabled?: boolean;
}

const lifelineConfig: { [key in LifelineType]: { label: string; icon: string } } = {
  fiftyFifty: { label: '50/50', icon: '½' },
  audience: { label: 'Pytanie do widowni', icon: '👥' },
  friend: { label: 'Pytanie do przyjaciela', icon: '📞' },
  challenge: { label: 'Wyzwanie', icon: '🎯' },
};

export default function Lifelines({
  usedLifelines,
  onUseLifeline,
  disabled = false,
}: LifelinesProps) {
  return (
    <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] p-6 rounded-xl shadow-2xl border-2 border-[#FFD700]/50">
      <h3 className="text-2xl font-black mb-6 text-center text-[#FFD700] tracking-wider uppercase">Koła Ratunkowe</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(lifelineConfig).map(([key, config]) => {
          const lifeline = key as LifelineType;
          const isUsed = usedLifelines.includes(lifeline);

          return (
            <button
              key={key}
              onClick={() => !disabled && !isUsed && onUseLifeline(lifeline)}
              disabled={disabled || isUsed}
              className={`p-6 rounded-xl font-black transition-all ${
                isUsed
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-30 border-2 border-gray-700'
                  : 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFE55C] hover:to-[#FFD700] transform hover:scale-110 active:scale-95 border-2 border-[#FFE55C] shadow-[0_0_20px_rgba(255,215,0,0.5)]'
              }`}
            >
              <div className="text-4xl mb-3">{config.icon}</div>
              <div className="text-sm font-bold">{config.label}</div>
              {isUsed && <div className="text-xs mt-2 font-bold">UŻYTE</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

