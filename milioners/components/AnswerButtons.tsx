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
      return 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50';
    }

    // If answer is confirmed
    if (answerConfirmed) {
      if (index === correctAnswerIndex) {
        // Correct answer - green
        return 'bg-green-600 text-white';
      } else if (index === selectedAnswer && !isAnswerCorrect) {
        // Wrong selected answer - red
        return 'bg-red-600 text-white';
      } else {
        // Other answers - gray
        return 'bg-gray-400 text-gray-600';
      }
    }

    // If answer is selected but not confirmed - yellow
    if (selectedAnswer === index) {
      return 'bg-yellow-500 text-white';
    }

    // Default - uniform color (blue-gray)
    return 'bg-blue-500 hover:bg-blue-600 text-white';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {answers.map((answer, index) => {
        const isVisible = visibleAnswers.includes(index);
        const isRemoved = fiftyFiftyRemovedAnswers.includes(index);
        const isSelected = selectedAnswer === index;
        const isDisabled = disabled || !isVisible || isRemoved || answerConfirmed;

        if (!isVisible && !isRemoved) {
          // Answer not yet revealed
          return null;
        }

        return (
          <button
            key={index}
            onClick={() => !isDisabled && onSelectAnswer(index)}
            disabled={isDisabled}
            className={`${getButtonColor(index)} p-6 rounded-lg text-xl font-semibold transition-all transform ${
              !isDisabled && !answerConfirmed ? 'hover:scale-105' : ''
            } ${isSelected && !answerConfirmed ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
          >
            <span className="mr-4 font-bold">{answerLabels[index]}</span>
            {answer}
          </button>
        );
      })}
    </div>
  );
}
