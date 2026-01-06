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
import IntroScreen from '@/components/IntroScreen';
import { useSoundPreloader } from '@/hooks/useSoundPreloader';
import { soundManager } from '@/lib/sounds';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: soundsLoading } = useSoundPreloader();
  const previousRoundRef = useRef<number>(0);
  const previousAnswerConfirmedRef = useRef<boolean>(false);
  const previousIsAnswerCorrectRef = useRef<boolean | null>(null);
  const previousQuestionIdRef = useRef<number | null>(null);
  const previousStatusRef = useRef<string>('not_started');
  const previousAudienceVoteActiveRef = useRef<boolean>(false);

  // Polling for game state updates
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const { fetchGameState: fetchState } = await import('@/lib/game-state-client');
        const data = await fetchState();
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

  // Play sounds based on game state changes
  useEffect(() => {
    if (!gameState) {
      return;
    }

    const currentQuestionId = gameState.currentQuestion?.id ?? null;
    const isGameActive = gameState.status === 'in_progress' || gameState.status === 'lost' || gameState.status === 'won';
    const statusChanged = gameState.status !== previousStatusRef.current;
    const isFirstQuestionAfterIntro = statusChanged && previousStatusRef.current === 'intro' && gameState.status === 'in_progress';

    // Play sound when new question appears
    // This includes:
    // 1. First question after intro (transition from 'intro' to 'in_progress')
    // 2. Question ID changes during active game
    if (
      isGameActive &&
      currentQuestionId !== null &&
      !gameState.answerConfirmed &&
      (
        isFirstQuestionAfterIntro ||
        (currentQuestionId !== previousQuestionIdRef.current && previousQuestionIdRef.current !== null)
      )
    ) {
      // New question appeared
      soundManager.play('newQuestion');
    }

    // Play sound when answer is confirmed
    // This should work even if status changed to 'lost' or 'won'
    if (
      gameState.answerConfirmed !== previousAnswerConfirmedRef.current &&
      gameState.answerConfirmed === true &&
      gameState.isAnswerCorrect !== null
    ) {
      if (gameState.isAnswerCorrect === true) {
        // Correct answer sound
        soundManager.play('correctAnswer');
      } else {
        // Wrong answer sound - play even if game status is 'lost'
        soundManager.play('wrongAnswer');
      }
    }

    // Also check if game just ended with wrong answer (status changed to 'lost')
    // This is a backup in case the answer confirmation sound didn't play
    if (
      gameState.status === 'lost' &&
      previousRoundRef.current > 0 &&
      gameState.isAnswerCorrect === false &&
      previousIsAnswerCorrectRef.current !== false
    ) {
      // Game was lost - play wrong answer sound
      soundManager.play('wrongAnswer');
    }

    // Play sound when audience vote is activated
    if (
      gameState.audienceVoteActive !== previousAudienceVoteActiveRef.current &&
      gameState.audienceVoteActive === true
    ) {
      // Audience vote activated
      soundManager.play('audienceVote');
    }

    // Update refs
    previousRoundRef.current = gameState.currentRound;
    previousAnswerConfirmedRef.current = gameState.answerConfirmed;
    previousIsAnswerCorrectRef.current = gameState.isAnswerCorrect;
    previousQuestionIdRef.current = currentQuestionId;
    previousStatusRef.current = gameState.status;
    previousAudienceVoteActiveRef.current = gameState.audienceVoteActive;
  }, [gameState]);


  if (loading || soundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d]">
        <div className="text-3xl font-black text-[#FFD700]">Ładowanie...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d]">
        <div className="text-3xl font-black text-red-500">Brak aktywnej gry</div>
      </div>
    );
  }

  // Show waiting screen if game hasn't started
  if (gameState.status === 'not_started') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-8">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-[#FFD700]">
          <h1 className="text-6xl font-black mb-8 text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">Milionerzy</h1>
          <p className="text-3xl text-white mb-6 font-bold">Oczekiwanie na rozpoczęcie gry...</p>
          <p className="text-xl text-[#FFD700] font-semibold">
            Prowadzący musi rozpocząć grę z panelu kontrolnego
          </p>
        </div>
      </div>
    );
  }

  // Show intro screen
  if (gameState.status === 'intro') {
    return <IntroScreen />;
  }

  // Show end screen if game is won or lost
  if (gameState.status === 'won' || gameState.status === 'lost') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-8">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-[#FFD700]">
          <h1 className="text-6xl font-black mb-8 text-[#FFD700] tracking-wider uppercase drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
            {gameState.status === 'won' ? '🎉 Gratulacje! 🎉' : '😔 Koniec Gry'}
          </h1>
          <p className="text-4xl mb-10 text-white font-black">
            {gameState.status === 'won'
              ? 'Wygrałeś główną nagrodę!'
              : 'Niestety, to była błędna odpowiedź.'}
          </p>
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl p-10 mb-10 border-4 border-[#FFE55C] shadow-[0_0_40px_rgba(255,215,0,0.8)]">
            <p className="text-3xl font-black mb-4 text-black">Twoja Pula:</p>
            <p className="text-6xl font-black text-black">
              {gameState.finalPrize.toLocaleString('pl-PL')} PLN
            </p>
          </div>
          <p className="text-xl text-[#FFD700] font-semibold">
            Prowadzący może rozpocząć nową grę z panelu kontrolnego
          </p>
        </div>
      </div>
    );
  }

  // Check if question is missing (shouldn't happen, but handle gracefully)
  if (!gameState.currentQuestion && gameState.status === 'in_progress') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-8">
        <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-red-500">
          <h1 className="text-4xl font-black mb-6 text-red-500">Błąd</h1>
          <p className="text-2xl text-white mb-6 font-bold">
            Nie udało się załadować pytania dla rundy {gameState.currentRound}
          </p>
          <p className="text-xl text-[#FFD700] font-semibold">
            Sprawdź czy w bazie pytań są dostępne pytania dla tego poziomu trudności.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Prize ladder - only shown after answer is confirmed */}
        {gameState.answerConfirmed && (
          <div className="mb-8">
            <PrizeLadder currentRound={gameState.currentRound} status={gameState.status} />
            {/* Show message about continuing or ending */}
            {gameState.isAnswerCorrect !== null && (
              <div className="mt-6 text-center">
                {gameState.isAnswerCorrect ? (
                  <div className="bg-gradient-to-r from-green-600 to-green-500 border-4 border-green-400 rounded-xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.8)]">
                    <p className="text-4xl font-black text-white mb-2">✓ POPRAWNA ODPOWIEDŹ!</p>
                    {gameState.status === 'in_progress' ? (
                      <p className="text-2xl font-bold text-white">Grasz dalej!</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-600 to-red-500 border-4 border-red-400 rounded-xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                    <p className="text-4xl font-black text-white mb-2">✗ BŁĘDNA ODPOWIEDŹ</p>
                    <p className="text-2xl font-bold text-white">Koniec gry</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main game area - full width - hidden when answer is confirmed */}
        {!gameState.answerConfirmed && (
          <div className="flex-1 flex flex-col">
            {/* Question - full width and centered */}
            <div className="w-full mb-8">
            <QuestionDisplay
              question={gameState.currentQuestion?.question || null}
              round={gameState.currentRound}
            />
            </div>

            {/* Answer buttons */}
            <div className="mb-8">
            <AnswerButtons
              answers={gameState.currentQuestion?.answers || []}
              selectedAnswer={gameState.selectedAnswer}
              onSelectAnswer={() => {}} // Answers are selected by host
              fiftyFiftyRemovedAnswers={gameState.fiftyFiftyRemovedAnswers}
              visibleAnswers={gameState.visibleAnswers}
              answerConfirmed={gameState.answerConfirmed}
              isAnswerCorrect={gameState.isAnswerCorrect}
              correctAnswerIndex={gameState.currentQuestion?.correctAnswer ?? null}
              disabled={true}
              />
            </div>

            {/* Audience vote - QR Code or Results */}
            {gameState.usedLifelines.includes('audience') && gameState.audienceVoteActive && gameState.gameId && (
              <div className="mb-8">
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
              <div className="mb-8">
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

            {/* Lifelines - at the bottom */}
            <div className="mt-auto">
              <Lifelines
                usedLifelines={gameState.usedLifelines}
                onUseLifeline={() => {}} // Koła ratunkowe nie są klikalne na ekranie gry
                disabled={true} // Zawsze wyłączone - tylko informacja
              />
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

