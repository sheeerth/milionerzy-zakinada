'use client';

interface AnswerButtonsProps {
  answers: string[];
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  fiftyFiftyRemovedAnswers: number[];
  visibleAnswers: number[];
  answerConfirmed: boolean;
  isAnswerCorrect: boolean | null;
  correctAnswerIndex: number | null;
  disabled?: boolean;
}

const answerLabels = ['A', 'B', 'C', 'D'];

export default function AnswerButtons({
  answers,
  selectedAnswer,
  onSelectAnswer,
  fiftyFiftyRemovedAnswers,
  visibleAnswers,
  answerConfirmed,
  isAnswerCorrect,
  correctAnswerIndex,
  disabled = false,
}: AnswerButtonsProps) {
  const getButtonColor = (index: number): string => {
    // If answer is removed by 50/50
    if (fiftyFiftyRemovedAnswers.includes(index)) {
      return 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-30 border-2 border-gray-700';
    }

    // If answer is confirmed
    if (answerConfirmed) {
      if (index === correctAnswerIndex) {
        // Correct answer - green with glow
        return 'bg-gradient-to-r from-green-600 to-green-500 text-white border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.8)]';
      } else if (index === selectedAnswer && !isAnswerCorrect) {
        // Wrong selected answer - red
        return 'bg-gradient-to-r from-red-600 to-red-500 text-white border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)]';
      } else {
        // Other answers - dark gray
        return 'bg-gray-800 text-gray-500 border-2 border-gray-700';
      }
    }

    // If answer is selected but not confirmed - gold with glow
    if (selectedAnswer === index) {
      return 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black border-4 border-[#FFE55C] shadow-[0_0_40px_rgba(255,215,0,0.9)] glow-gold font-black';
    }

    // Default - gold buttons like in the show
    return 'bg-gradient-to-r from-[#001a4d] to-[#000428] hover:from-[#FFD700] hover:to-[#FFA500] text-white border-2 border-[#FFD700]/50 hover:border-[#FFD700] hover:text-black transition-all duration-300';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {answers.map((answer, index) => {
        const isVisible = visibleAnswers.includes(index);
        const isRemoved = fiftyFiftyRemovedAnswers.includes(index);
        const isSelected = selectedAnswer === index;
        const isDisabled = disabled || !isVisible || isRemoved || answerConfirmed;

        // Show placeholder for answers not yet revealed
        if (!isVisible && !isRemoved) {
          return (
            <div
              key={index}
              className="bg-gradient-to-r from-[#001a4d] to-[#000428] border-2 border-[#FFD700]/30 p-8 rounded-xl text-2xl md:text-3xl font-black opacity-50 flex items-center justify-center"
            >
              <span className="mr-6 font-black text-3xl md:text-4xl text-[#FFD700]/50">{answerLabels[index]}</span>
              <span className="text-gray-500 italic">Odpowiedź {index + 1}</span>
            </div>
          );
        }

        return (
          <button
            key={index}
            onClick={() => !isDisabled && onSelectAnswer(index)}
            disabled={isDisabled}
            className={`${getButtonColor(index)} p-8 rounded-xl text-2xl md:text-3xl font-black transition-all transform ${
              !isDisabled && !answerConfirmed ? 'hover:scale-105 active:scale-95' : ''
            } ${isSelected && !answerConfirmed ? 'scale-105' : ''}`}
          >
            <span className="mr-6 font-black text-3xl md:text-4xl">{answerLabels[index]}</span>
            <span className="leading-tight">{answer}</span>
          </button>
        );
      })}
    </div>
  );
}
