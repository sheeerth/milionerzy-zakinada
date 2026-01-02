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

  const handleShowNextAnswer = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'showNextAnswer' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error showing next answer:', error);
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

  const handleMoveToNextRound = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moveToNextRound' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error moving to next round:', error);
    }
  };

  const handleStartFirstQuestion = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'startFirstQuestion' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error starting first question:', error);
    }
  };

  const handleResetGame = async () => {
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error resetting game:', error);
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

  const handleEndGame = async () => {
    if (!confirm('Czy na pewno chcesz zakończyć grę? Gracz otrzyma pulę zgodnie z aktualnym poziomem.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'endGame' }),
      });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const getVotingUrl = () => {
    if (!gameState?.gameId) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/vote/${gameState.gameId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d]">
        <div className="text-3xl font-black text-[#FFD700]">Ładowanie...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d]">
        <div className="text-3xl font-black text-red-500">Błąd ładowania stanu gry</div>
      </div>
    );
  }

  if (gameState.status === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-8">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-12 text-center border-4 border-[#FFD700]">
          <h1 className="text-5xl font-black mb-8 text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">Panel Prowadzącego</h1>
          <button
            onClick={handleStartGame}
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-6 px-12 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
          >
            Rozpocznij Grę
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-gradient-to-r from-[#000428] to-[#001a4d] text-white p-6 rounded-xl flex justify-between items-center border-2 border-[#FFD700] shadow-2xl">
          <div>
            <h1 className="text-3xl font-black text-[#FFD700] tracking-wider uppercase">Panel Prowadzącego</h1>
            <p className="text-lg font-bold text-white mt-2">Status: {gameState.status === 'in_progress' ? 'W TRAKCIE' : gameState.status === 'intro' ? 'CZÓŁÓWKA' : gameState.status.toUpperCase()}</p>
          </div>
          <div className="flex gap-4">
            {gameState.status === 'intro' && (
              <button
                onClick={handleStartFirstQuestion}
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
              >
                Przejdź do pierwszego pytania
              </button>
            )}
            {gameState.status === 'in_progress' && (
              <button
                onClick={handleEndGame}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              >
                Zakończ Grę
              </button>
            )}
            {(gameState.status === 'won' || gameState.status === 'lost') && (
              <button
                onClick={handleResetGame}
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
              >
                Nowa Gra
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main game area */}
          <div className="lg:col-span-2 space-y-6">
            <QuestionDisplay
              question={gameState.currentQuestion?.question || null}
              round={gameState.currentRound}
            />

            {/* Show answers button */}
            {gameState.currentQuestion && 
             gameState.visibleAnswers.length < gameState.currentQuestion.answers.length && 
             !gameState.answerConfirmed && 
             gameState.status === 'in_progress' && (
              <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] border-2 border-[#FFD700] rounded-xl p-6">
                <button
                  onClick={handleShowNextAnswer}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-4 px-8 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
                >
                  Pokaż odpowiedź {gameState.visibleAnswers.length + 1}
                </button>
              </div>
            )}

            <AnswerButtons
              answers={gameState.currentQuestion?.answers || []}
              selectedAnswer={gameState.selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              fiftyFiftyRemovedAnswers={gameState.fiftyFiftyRemovedAnswers}
              visibleAnswers={gameState.visibleAnswers}
              answerConfirmed={gameState.answerConfirmed}
              isAnswerCorrect={gameState.isAnswerCorrect}
              correctAnswerIndex={gameState.currentQuestion?.correctAnswer ?? null}
              disabled={gameState.status !== 'in_progress' || gameState.answerConfirmed}
            />

            {/* Answer confirmation */}
            {gameState.selectedAnswer !== null && 
             !gameState.answerConfirmed && 
             gameState.status === 'in_progress' && (
              <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] border-4 border-[#FFD700] rounded-xl p-6 shadow-2xl">
                <p className="text-center mb-6 font-black text-2xl text-[#FFD700]">
                  Zaznaczona odpowiedź: <span className="text-white text-3xl">{['A', 'B', 'C', 'D'][gameState.selectedAnswer]}</span>
                </p>
                <button
                  onClick={handleConfirmAnswer}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black py-4 px-8 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.8)]"
                >
                  Potwierdź odpowiedź
                </button>
              </div>
            )}

            {/* Move to next round button - shown after correct answer is confirmed */}
            {gameState.answerConfirmed && 
             gameState.isAnswerCorrect === true && 
             gameState.status === 'in_progress' && (
              <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] border-4 border-[#FFD700] rounded-xl p-6 shadow-2xl">
                <p className="text-center mb-6 font-black text-2xl text-[#FFD700]">
                  ✓ Poprawna odpowiedź! Gracz przechodzi do następnego pytania.
                </p>
                <button
                  onClick={handleMoveToNextRound}
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-4 px-8 rounded-xl text-2xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
                >
                  Przejdź do następnego pytania
                </button>
              </div>
            )}

            {/* Lifelines */}
            <Lifelines
              usedLifelines={gameState.usedLifelines}
              onUseLifeline={handleUseLifeline}
              disabled={
                gameState.status !== 'in_progress' ||
                !gameState.currentQuestion ||
                gameState.visibleAnswers.length < gameState.currentQuestion.answers.length
              }
            />

            {/* Audience vote - QR Code or Results */}
            {gameState.usedLifelines.includes('audience') && gameState.audienceVoteActive && (
              <div>
                {!gameState.showAudienceResults ? (
                  <div>
                    <QRCodeDisplay url={getVotingUrl()} gameId={gameState.gameId} />
                    <button
                      onClick={handleToggleAudienceResults}
                      className="mt-6 w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
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
                      className="mt-6 w-full bg-gradient-to-r from-[#001a4d] to-[#000428] hover:from-[#FFD700] hover:to-[#FFA500] text-white hover:text-black font-black py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 border-2 border-[#FFD700]"
                    >
                      Wróć do QR kodu
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Friend question - Audio player */}
            {gameState.usedLifelines.includes('friend') && gameState.friendActive && gameState.currentQuestion && (
              <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] p-8 rounded-xl shadow-2xl border-2 border-[#FFD700]">
                <h3 className="text-2xl font-black mb-6 text-center text-[#FFD700] tracking-wider uppercase">Pytanie do przyjaciela</h3>
                {audioPlaying ? (
                  <div className="text-center">
                    <p className="text-2xl mb-6 font-bold text-white">Odtwarzanie nagrania...</p>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                          setAudioPlaying(false);
                        }
                      }}
                      className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    >
                      Zatrzymaj
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white mb-6 font-bold text-lg">
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
                      className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
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


