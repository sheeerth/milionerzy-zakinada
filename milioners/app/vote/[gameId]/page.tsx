'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VotePage() {
  const params = useParams();
  const gameId = params?.gameId as string;
  const [question, setQuestion] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [voted, setVoted] = useState(false);
  const [voterId, setVoterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setError('Brak ID gry');
      setLoading(false);
      return;
    }

    // Generate unique voter ID (stored in localStorage to prevent duplicate votes)
    const storedVoterId = localStorage.getItem(`voter_${gameId}`);
    if (storedVoterId) {
      setVoterId(storedVoterId);
      setVoted(true);
    } else {
      const newVoterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setVoterId(newVoterId);
      localStorage.setItem(`voter_${gameId}`, newVoterId);
    }

    // Fetch current question from game state
    const fetchQuestion = async () => {
      try {
        const response = await fetch('/api/game-state');
        const data = await response.json();
        if (data.currentQuestion) {
          setQuestion(data.currentQuestion.question);
          setAnswers(data.currentQuestion.answers);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Błąd ładowania pytania');
        setLoading(false);
      }
    };

    fetchQuestion();
    const interval = setInterval(fetchQuestion, 2000); // Poll for question updates

    return () => clearInterval(interval);
  }, [gameId]);

  const handleVote = async (answerIndex: number) => {
    if (voted || !gameId || !voterId) {
      console.error('Cannot vote:', { voted, gameId, voterId });
      return;
    }

    try {
      console.log('Sending vote:', { gameId, answerIndex, voterId });
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          answerIndex,
          voterId,
        }),
      });

      const data = await response.json();
      console.log('Vote response:', data);

      if (response.ok) {
        setVoted(true);
      } else {
        setError(data.error || 'Błąd podczas głosowania');
      }
    } catch (error) {
      console.error('Error voting:', error);
      setError('Błąd podczas głosowania');
    }
  };

  const answerLabels = ['A', 'B', 'C', 'D'];
  const answerColors = [
    'bg-blue-600 hover:bg-blue-700',
    'bg-green-600 hover:bg-green-700',
    'bg-yellow-600 hover:bg-yellow-700',
    'bg-red-600 hover:bg-red-700',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 flex items-center justify-center p-4">
        <div className="text-white text-2xl">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md w-full">
          <p className="text-red-600 text-xl font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!question || answers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md w-full">
          <p className="text-gray-600 text-xl">Brak aktywnego pytania</p>
          <p className="text-gray-500 mt-2">Poczekaj na rozpoczęcie głosowania</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-center mb-4 text-purple-900">
            Głosowanie Widowni
          </h1>
          <div className="bg-purple-100 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">{question}</h2>
          </div>

          {voted ? (
            <div className="text-center py-8">
              <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-4">
                <p className="text-2xl font-bold text-green-800 mb-2">✓ Twój głos został oddany!</p>
                <p className="text-green-700">Dziękujemy za udział w głosowaniu.</p>
              </div>
              <p className="text-sm text-gray-600">
                Możesz głosować tylko raz na pytanie.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-700 mb-4 font-semibold">
                Wybierz odpowiedź:
              </p>
              {answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  className={`w-full ${answerColors[index]} text-white p-6 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg`}
                >
                  <span className="mr-4 font-bold text-2xl">{answerLabels[index]}</span>
                  {answer}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-white text-sm">
          <p>ID Gry: {gameId}</p>
        </div>
      </div>
    </div>
  );
}

