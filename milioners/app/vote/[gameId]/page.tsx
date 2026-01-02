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
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-4">
        <div className="text-[#FFD700] text-3xl font-black">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-8 text-center max-w-md w-full border-4 border-red-500">
          <p className="text-red-500 text-2xl font-black">{error}</p>
        </div>
      </div>
    );
  }

  if (!question || answers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-8 text-center max-w-md w-full border-4 border-[#FFD700]">
          <p className="text-white text-2xl font-black mb-4">Brak aktywnego pytania</p>
          <p className="text-[#FFD700] text-lg font-bold">Poczekaj na rozpoczęcie głosowania</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-8 mb-6 border-4 border-[#FFD700]">
          <h1 className="text-4xl font-black text-center mb-6 text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
            Głosowanie Widowni
          </h1>
          <div className="bg-gradient-to-br from-[#000428] to-[#001a4d] p-6 rounded-xl mb-8 border-2 border-[#FFD700]/50">
            <h2 className="text-2xl font-black text-white leading-tight">{question}</h2>
          </div>

          {voted ? (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-green-600 to-green-500 border-4 border-green-400 rounded-xl p-8 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.8)]">
                <p className="text-3xl font-black text-white mb-4">✓ Twój głos został oddany!</p>
                <p className="text-xl text-white font-bold">Dziękujemy za udział w głosowaniu.</p>
              </div>
              <p className="text-lg text-[#FFD700] font-bold">
                Możesz głosować tylko raz na pytanie.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-center text-white mb-6 font-black text-2xl">
                Wybierz odpowiedź:
              </p>
              {answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  className={`w-full ${answerColors[index]} text-white p-8 rounded-xl text-2xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-white/20 hover:border-white`}
                >
                  <span className="mr-6 font-black text-3xl">{answerLabels[index]}</span>
                  {answer}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-[#FFD700] text-lg font-bold">
          <p>ID Gry: {gameId}</p>
        </div>
      </div>
    </div>
  );
}

