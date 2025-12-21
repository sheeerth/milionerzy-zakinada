'use client';

interface AnswerButtonsProps {
  answers: string[];
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  fiftyFiftyRemovedAnswers: number[];
  disabled?: boolean;
}

const answerLabels = ['A', 'B', 'C', 'D'];
const answerColors = [
  'bg-blue-600 hover:bg-blue-700',
  'bg-green-600 hover:bg-green-700',
  'bg-yellow-600 hover:bg-yellow-700',
  'bg-red-600 hover:bg-red-700',
];

export default function AnswerButtons({
  answers,
  selectedAnswer,
  onSelectAnswer,
  fiftyFiftyRemovedAnswers,
  disabled = false,
}: AnswerButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {answers.map((answer, index) => {
        const isRemoved = fiftyFiftyRemovedAnswers.includes(index);
        const isSelected = selectedAnswer === index;

        if (isRemoved) {
          return (
            <button
              key={index}
              disabled
              className="bg-gray-400 text-gray-600 p-6 rounded-lg text-xl font-semibold cursor-not-allowed opacity-50"
            >
              <span className="mr-4">{answerLabels[index]}</span>
              {answer}
            </button>
          );
        }

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelectAnswer(index)}
            disabled={disabled}
            className={`${answerColors[index]} ${
              isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-800' : ''
            } text-white p-6 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="mr-4 font-bold">{answerLabels[index]}</span>
            {answer}
          </button>
        );
      })}
    </div>
  );
}

