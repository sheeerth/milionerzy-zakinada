'use client';

import { useEffect, useState } from 'react';
import { GameState } from '@/lib/game-state';
import QuestionDisplay from '@/components/QuestionDisplay';
import AnswerButtons from '@/components/AnswerButtons';
import PrizeLadder from '@/components/PrizeLadder';
import Lifelines from '@/components/Lifelines';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import VotingResults from '@/components/VotingResults';
import ChallengeBoard from '@/components/ChallengeBoard';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  // Polling for game state updates
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch('/api/game-state');
        const data = await response.json();
        console.log('Game state received:', {
          status: data.status,
          currentRound: data.currentRound,
          hasQuestion: !!data.currentQuestion,
          question: data.currentQuestion?.question
        });
        setGameState(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game state:', error);
        setLoading(false);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000); // Poll every second

    return () => clearInterval(interval);
  }, []);

  const handleUseLifeline = async (lifeline: string) => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'useLifeline', lifeline }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error using lifeline:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Ładowanie...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Brak aktywnej gry</div>
      </div>
    );
  }

  // Show waiting screen if game hasn't started
  if (gameState.status === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold mb-6">Milionerzy</h1>
          <p className="text-2xl text-gray-600 mb-4">Oczekiwanie na rozpoczęcie gry...</p>
          <p className="text-lg text-gray-500">
            Prowadzący musi rozpocząć grę z panelu kontrolnego
          </p>
        </div>
      </div>
    );
  }

  // Show end screen if game is won or lost
  if (gameState.status === 'won' || gameState.status === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl w-full text-center">
          <h1 className="text-5xl font-bold mb-6">
            {gameState.status === 'won' ? '🎉 Gratulacje! 🎉' : '😔 Koniec Gry'}
          </h1>
          <p className="text-3xl mb-8">
            {gameState.status === 'won'
              ? 'Wygrałeś główną nagrodę!'
              : 'Niestety, to była błędna odpowiedź.'}
          </p>
          <div className="bg-yellow-400 rounded-lg p-8 mb-8">
            <p className="text-2xl font-semibold mb-2">Twoja Pula:</p>
            <p className="text-5xl font-bold text-blue-900">
              {gameState.finalPrize.toLocaleString('pl-PL')} PLN
            </p>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/game-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset' }),
              });
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            Nowa Gra
          </button>
        </div>
      </div>
    );
  }

  // Check if question is missing (shouldn't happen, but handle gracefully)
  if (!gameState.currentQuestion && gameState.status === 'in_progress') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Błąd</h1>
          <p className="text-xl text-gray-600 mb-4">
            Nie udało się załadować pytania dla rundy {gameState.currentRound}
          </p>
          <p className="text-lg text-gray-500">
            Sprawdź czy w bazie pytań są dostępne pytania dla tego poziomu trudności.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <QuestionDisplay
              question={gameState.currentQuestion?.question || null}
              round={gameState.currentRound}
            />
            <AnswerButtons
              answers={gameState.currentQuestion?.answers || []}
              selectedAnswer={gameState.selectedAnswer}
              onSelectAnswer={() => {}} // Answers are selected by host
              fiftyFiftyRemovedAnswers={gameState.fiftyFiftyRemovedAnswers}
              disabled={true}
            />
            <div className="mt-8">
              <Lifelines
                usedLifelines={gameState.usedLifelines}
                onUseLifeline={handleUseLifeline}
                disabled={gameState.status !== 'in_progress'}
              />
            </div>

            {/* Audience vote - QR Code or Results */}
            {gameState.usedLifelines.includes('audience') && gameState.audienceVoteActive && gameState.gameId && (
              <div className="mt-8">
                {!gameState.showAudienceResults ? (
                  <QRCodeDisplay
                    url={typeof window !== 'undefined' ? `${window.location.origin}/vote/${gameState.gameId}` : ''}
                    gameId={gameState.gameId}
                    large={true}
                  />
                ) : (
                  <VotingResults
                    results={gameState.audienceVoteResults}
                    answers={gameState.currentQuestion?.answers || []}
                  />
                )}
              </div>
            )}

            {/* Challenge board */}
            {gameState.usedLifelines.includes('challenge') && gameState.challengeActive && (
              <div className="mt-8">
                <ChallengeBoard
                  selectedNumber={gameState.challengeSelectedNumber}
                  onSelectNumber={() => {}} // Only host can select
                  accepted={gameState.challengeAccepted}
                  onAccept={() => {}} // Only host can accept
                  onReject={() => {}} // Only host can reject
                  disabled={true}
                />
              </div>
            )}
          </div>

          {/* Prize ladder */}
          <div className="lg:col-span-1">
            <PrizeLadder currentRound={gameState.currentRound} status={gameState.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

