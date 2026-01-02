'use client';

interface ChallengeBoardProps {
  selectedNumber: number | null;
  onSelectNumber: (number: number) => void;
  accepted: boolean | null;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export default function ChallengeBoard({
  selectedNumber,
  onSelectNumber,
  accepted,
  onAccept,
  onReject,
  disabled = false,
}: ChallengeBoardProps) {
  return (
    <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] p-8 rounded-xl shadow-2xl border-2 border-[#FFD700]">
      <h3 className="text-3xl font-black mb-6 text-center text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">Wyzwanie</h3>
      
      {accepted === null && (
        <>
          <p className="text-center mb-8 text-white text-xl font-bold">
            Wybierz numer wyzwania (1-10):
          </p>
          <div className="grid grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => !disabled && onSelectNumber(num)}
                disabled={disabled}
                className={`p-6 rounded-xl font-black text-2xl transition-all ${
                  selectedNumber === num
                    ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black border-4 border-[#FFE55C] shadow-[0_0_30px_rgba(255,215,0,0.8)] glow-gold scale-110'
                    : 'bg-gradient-to-br from-[#001a4d] to-[#000428] text-white border-2 border-[#FFD700]/50 hover:border-[#FFD700] hover:from-[#FFD700] hover:to-[#FFA500] hover:text-black'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {num}
              </button>
            ))}
          </div>
          
          {selectedNumber !== null && (
            <div className="flex gap-6 justify-center">
              <button
                onClick={onAccept}
                disabled={disabled}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black py-4 px-8 rounded-xl text-xl shadow-[0_0_20px_rgba(34,197,94,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                Akceptuj wyzwanie
              </button>
              <button
                onClick={onReject}
                disabled={disabled}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-4 px-8 rounded-xl text-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                Odrzuć wyzwanie
              </button>
            </div>
          )}
        </>
      )}
      
      {accepted === true && (
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-500 border-4 border-green-400 rounded-xl p-8 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.8)]">
            <p className="text-3xl font-black text-white mb-4">
              ✓ Wyzwanie zaakceptowane!
            </p>
            <p className="text-xl text-white font-bold">
              Pytanie zostało zaliczone. Przechodzisz do następnego pytania.
            </p>
          </div>
        </div>
      )}
      
      {accepted === false && (
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-500 border-4 border-red-400 rounded-xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.8)]">
            <p className="text-3xl font-black text-white mb-4">
              ✗ Wyzwanie odrzucone
            </p>
            <p className="text-xl text-white font-bold">
              Wyzwanie nie zostało spełnione. Kontynuuj grę.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

