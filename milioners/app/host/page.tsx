'use client';

import { useEffect, useState, useRef } from 'react';
import { GameState } from '@/lib/game-state';
import QuestionDisplay from '@/components/QuestionDisplay';
import AnswerButtons from '@/components/AnswerButtons';
import PrizeLadder from '@/components/PrizeLadder';
import Lifelines from '@/components/Lifelines';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import VotingResults from '@/components/VotingResults';
import ChallengeBoard from '@/components/ChallengeBoard';

export default function HostPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Polling for game state updates
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch('/api/game-state');
        const data = await response.json();
        setGameState(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game state:', error);
        setLoading(false);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 1000);

    return () => clearInterval(interval);
  }, []);

  // Poll for voting results when audience vote is active
  useEffect(() => {
    if (!gameState?.audienceVoteActive || !gameState?.gameId) {
      console.log('Skipping vote fetch - audienceVoteActive:', gameState?.audienceVoteActive, 'gameId:', gameState?.gameId);
      return;
    }

    const fetchVotes = async () => {
      try {
        console.log('Fetching votes for gameId:', gameState.gameId);
        const response = await fetch(`/api/votes/${gameState.gameId}`);
        
        if (!response.ok) {
          console.error('Failed to fetch votes:', response.status, response.statusText);
          return;
        }
        
        const results = await response.json();
        console.log('Votes fetched:', results);
        
        if (results && Object.keys(results).length > 0) {
          // Update game state with results
          const updateResponse = await fetch('/api/game-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'setAudienceVoteResults', results }),
          });
          
          if (updateResponse.ok) {
            const updatedState = await updateResponse.json();
            setGameState(updatedState);
          }
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    fetchVotes(); // Fetch immediately
    const interval = setInterval(fetchVotes, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [gameState?.audienceVoteActive, gameState?.gameId]);

  const handleStartGame = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleSelectAnswer = async (index: number) => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'selectAnswer', answerIndex: index }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error selecting answer:', error);
    }
  };

  const handleConfirmAnswer = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmAnswer' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error confirming answer:', error);
    }
  };

  const handleUseLifeline = async (lifeline: string) => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'useLifeline', lifeline }),
      });
      const data = await response.json();
      setGameState(data);

      // Handle friend question audio
      if (lifeline === 'friend' && gameState?.currentQuestion?.voiceFile) {
        const audio = new Audio(`/voices/${gameState.currentQuestion.voiceFile}`);
        audioRef.current = audio;
        setAudioPlaying(true);
        audio.play();
        audio.onended = () => setAudioPlaying(false);
        audio.onerror = () => {
          console.error('Error playing audio');
          setAudioPlaying(false);
        };
      }
    } catch (error) {
      console.error('Error using lifeline:', error);
    }
  };

  const handleSetChallengeNumber = async (number: number) => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setChallengeNumber', number }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error setting challenge number:', error);
    }
  };

  const handleAcceptChallenge = async () => {
    try {
      console.log('Accepting challenge, current round:', gameState?.currentRound);
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acceptChallenge' }),
      });
      const data = await response.json();
      console.log('Challenge accepted, new round:', data.currentRound, 'new question:', data.currentQuestion?.question);
      setGameState(data);
    } catch (error) {
      console.error('Error accepting challenge:', error);
    }
  };

  const handleRejectChallenge = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rejectChallenge' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error rejecting challenge:', error);
    }
  };

  const handleToggleAudienceResults = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleAudienceResults' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error toggling audience results:', error);
    }
  };

  const getVotingUrl = () => {
    if (!gameState?.gameId) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/vote/${gameState.gameId}`;
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
        <div className="text-2xl">Błąd ładowania stanu gry</div>
      </div>
    );
  }

  if (gameState.status === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-12 text-center">
          <h1 className="text-4xl font-bold mb-6">Panel Prowadzącego</h1>
          <button
            onClick={handleStartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
          >
            Rozpocznij Grę
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-blue-900 text-white p-4 rounded-lg">
          <h1 className="text-2xl font-bold">Panel Prowadzącego</h1>
          <p className="text-sm">Status: {gameState.status === 'in_progress' ? 'W trakcie' : gameState.status}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main game area */}
          <div className="lg:col-span-2 space-y-6">
            <QuestionDisplay
              question={gameState.currentQuestion?.question || null}
              round={gameState.currentRound}
            />

            <AnswerButtons
              answers={gameState.currentQuestion?.answers || []}
              selectedAnswer={gameState.selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              fiftyFiftyRemovedAnswers={gameState.fiftyFiftyRemovedAnswers}
              disabled={gameState.status !== 'in_progress'}
            />

            {/* Answer confirmation */}
            {gameState.selectedAnswer !== null && gameState.status === 'in_progress' && (
              <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4">
                <p className="text-center mb-4 font-semibold">
                  Zaznaczona odpowiedź: {['A', 'B', 'C', 'D'][gameState.selectedAnswer]}
                </p>
                <button
                  onClick={handleConfirmAnswer}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Potwierdź odpowiedź
                </button>
              </div>
            )}

            {/* Lifelines */}
            <Lifelines
              usedLifelines={gameState.usedLifelines}
              onUseLifeline={handleUseLifeline}
              disabled={gameState.status !== 'in_progress'}
            />

            {/* Audience vote - QR Code or Results */}
            {gameState.usedLifelines.includes('audience') && gameState.audienceVoteActive && (
              <div>
                {!gameState.showAudienceResults ? (
                  <div>
                    <QRCodeDisplay url={getVotingUrl()} gameId={gameState.gameId} />
                    <button
                      onClick={handleToggleAudienceResults}
                      className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Pokaż wyniki głosowania
                    </button>
                  </div>
                ) : (
                  <div>
                    <VotingResults
                      results={gameState.audienceVoteResults}
                      answers={gameState.currentQuestion?.answers || []}
                    />
                    <button
                      onClick={handleToggleAudienceResults}
                      className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Wróć do QR kodu
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Friend question - Audio player */}
            {gameState.usedLifelines.includes('friend') && gameState.friendActive && gameState.currentQuestion && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Pytanie do przyjaciela</h3>
                {audioPlaying ? (
                  <div className="text-center">
                    <p className="text-lg mb-4">Odtwarzanie nagrania...</p>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                          setAudioPlaying(false);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Zatrzymaj
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Plik: {gameState.currentQuestion.voiceFile}
                    </p>
                    <button
                      onClick={() => {
                        if (gameState?.currentQuestion?.voiceFile) {
                          const audio = new Audio(`/voices/${gameState.currentQuestion.voiceFile}`);
                          audioRef.current = audio;
                          setAudioPlaying(true);
                          audio.play();
                          audio.onended = () => setAudioPlaying(false);
                          audio.onerror = () => {
                            console.error('Error playing audio');
                            setAudioPlaying(false);
                          };
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Odtwórz nagranie
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Challenge board */}
            {gameState.usedLifelines.includes('challenge') && gameState.challengeActive && (
              <ChallengeBoard
                selectedNumber={gameState.challengeSelectedNumber}
                onSelectNumber={handleSetChallengeNumber}
                accepted={gameState.challengeAccepted}
                onAccept={handleAcceptChallenge}
                onReject={handleRejectChallenge}
                disabled={gameState.status !== 'in_progress'}
              />
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

