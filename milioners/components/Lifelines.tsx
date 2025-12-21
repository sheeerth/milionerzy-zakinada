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
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Koła Ratunkowe</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(lifelineConfig).map(([key, config]) => {
          const lifeline = key as LifelineType;
          const isUsed = usedLifelines.includes(lifeline);

          return (
            <button
              key={key}
              onClick={() => !disabled && !isUsed && onUseLifeline(lifeline)}
              disabled={disabled || isUsed}
              className={`p-4 rounded-lg font-semibold transition-all ${
                isUsed
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
              }`}
            >
              <div className="text-3xl mb-2">{config.icon}</div>
              <div className="text-sm">{config.label}</div>
              {isUsed && <div className="text-xs mt-1">Użyte</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

