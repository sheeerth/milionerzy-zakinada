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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-center">Wyzwanie</h3>
      
      {accepted === null && (
        <>
          <p className="text-center mb-6 text-gray-700">
            Wybierz numer wyzwania (1-10):
          </p>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => !disabled && onSelectNumber(num)}
                disabled={disabled}
                className={`p-4 rounded-lg font-bold text-xl transition-all ${
                  selectedNumber === num
                    ? 'bg-yellow-500 text-white ring-4 ring-yellow-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {num}
              </button>
            ))}
          </div>
          
          {selectedNumber !== null && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={onAccept}
                disabled={disabled}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Akceptuj wyzwanie
              </button>
              <button
                onClick={onReject}
                disabled={disabled}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Odrzuć wyzwanie
              </button>
            </div>
          )}
        </>
      )}
      
      {accepted === true && (
        <div className="text-center">
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-4">
            <p className="text-2xl font-bold text-green-800 mb-2">
              ✓ Wyzwanie zaakceptowane!
            </p>
            <p className="text-lg text-green-700">
              Pytanie zostało zaliczone. Przechodzisz do następnego pytania.
            </p>
          </div>
        </div>
      )}
      
      {accepted === false && (
        <div className="text-center">
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6">
            <p className="text-2xl font-bold text-red-800 mb-2">
              ✗ Wyzwanie odrzucone
            </p>
            <p className="text-lg text-red-700">
              Wyzwanie nie zostało spełnione. Kontynuuj grę.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

