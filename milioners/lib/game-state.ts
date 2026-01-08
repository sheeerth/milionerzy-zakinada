import { Question, getQuestionForRound, getPrizeForRound, getSafeHavenPrize } from './questions';
import { v4 as uuidv4 } from 'uuid';

export type LifelineType = 'fiftyFifty' | 'audience' | 'friend' | 'challenge';
export type GameStatus = 'not_started' | 'intro' | 'in_progress' | 'won' | 'lost';

export interface GameState {
  gameId: string;
  status: GameStatus;
  currentRound: number;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  answerConfirmed: boolean; // Whether answer has been confirmed
  isAnswerCorrect: boolean | null; // null = not confirmed, true = correct, false = wrong
  visibleAnswers: number[]; // Which answer indices are visible
  usedQuestionIds: number[];
  usedLifelines: LifelineType[];
  fiftyFiftyRemovedAnswers: number[]; // Indices of removed answers
  audienceVoteActive: boolean;
  audienceVoteResults: { [key: number]: number } | null; // answer index -> vote count
  showAudienceResults: boolean; // Whether to show results instead of QR code
  friendActive: boolean; // Whether friend lifeline is currently active
  friendAudioPlaying: boolean; // Whether friend audio is currently playing
  challengeActive: boolean;
  challengeSelectedNumber: number | null;
  challengeAccepted: boolean | null;
  finalPrize: number;
}

export function createInitialGameState(): GameState {
  return {
    gameId: uuidv4(),
    status: 'not_started',
    currentRound: 0,
    currentQuestion: null,
    selectedAnswer: null,
    answerConfirmed: false,
    isAnswerCorrect: null,
    visibleAnswers: [],
    usedQuestionIds: [],
    usedLifelines: [],
    fiftyFiftyRemovedAnswers: [],
    audienceVoteActive: false,
    audienceVoteResults: null,
    showAudienceResults: false,
    friendActive: false,
    friendAudioPlaying: false,
    challengeActive: false,
    challengeSelectedNumber: null,
    challengeAccepted: null,
    finalPrize: 0,
  };
}

export function startGame(state: GameState): GameState {
  const newState = { ...state };
  // Start with intro screen
  newState.status = 'intro';
  newState.currentRound = 0;
  newState.currentQuestion = null;
  newState.visibleAnswers = [];
  newState.selectedAnswer = null;
  newState.answerConfirmed = false;
  newState.isAnswerCorrect = null;
  return newState;
}

export function startFirstQuestion(state: GameState): GameState {
  const newState = { ...state };
  // Move from intro to first question
  newState.status = 'in_progress';
  newState.currentRound = 1;
  newState.currentQuestion = getQuestionForRound(1, []);
  if (newState.currentQuestion) {
    newState.usedQuestionIds.push(newState.currentQuestion.id);
  }
  newState.visibleAnswers = [];
  newState.selectedAnswer = null;
  newState.answerConfirmed = false;
  newState.isAnswerCorrect = null;
  return newState;
}

export function selectAnswer(state: GameState, answerIndex: number): GameState {
  const newState = { ...state };
  newState.selectedAnswer = answerIndex;
  return newState;
}

export function confirmAnswer(state: GameState): GameState {
  if (!state.currentQuestion || state.selectedAnswer === null) {
    return state;
  }

  const newState = { ...state };
  // We know currentQuestion is not null due to check above
  const isCorrect = newState.selectedAnswer === newState.currentQuestion!.correctAnswer;
  
  // Mark answer as confirmed and store correctness
  newState.answerConfirmed = true;
  newState.isAnswerCorrect = isCorrect;

  if (isCorrect) {
    // Move to next round after a delay (handled by UI)
    if (newState.currentRound >= 12) {
      // Won the game!
      newState.status = 'won';
      newState.finalPrize = getPrizeForRound(12);
    } else {
      // Will move to next round after delay
    }
  } else {
    // Wrong answer - game over
    // Player gets the safe haven prize (not the prize from previous round)
    newState.status = 'lost';
    newState.finalPrize = getSafeHavenPrize(newState.currentRound);
  }

  return newState;
}

export function moveToNextRound(state: GameState): GameState {
  const newState = { ...state };
  newState.currentRound += 1;
  newState.currentQuestion = getQuestionForRound(newState.currentRound, newState.usedQuestionIds);
  if (newState.currentQuestion) {
    newState.usedQuestionIds.push(newState.currentQuestion.id);
  }
  newState.selectedAnswer = null;
  newState.answerConfirmed = false;
  newState.isAnswerCorrect = null;
  newState.visibleAnswers = [];
  newState.fiftyFiftyRemovedAnswers = [];
  newState.audienceVoteActive = false;
  newState.audienceVoteResults = null;
    newState.showAudienceResults = false;
    newState.friendActive = false;
    newState.friendAudioPlaying = false;
    newState.challengeActive = false;
  newState.challengeSelectedNumber = null;
  newState.challengeAccepted = null;
  return newState;
}

export function showNextAnswer(state: GameState): GameState {
  if (!state.currentQuestion) {
    return state;
  }

  const newState = { ...state };
  const totalAnswers = state.currentQuestion.answers.length;
  
  // Show next answer if not all are visible
  if (newState.visibleAnswers.length < totalAnswers) {
    newState.visibleAnswers.push(newState.visibleAnswers.length);
  }
  
  return newState;
}

export function useLifeline(state: GameState, lifeline: LifelineType): GameState {
  if (state.usedLifelines.includes(lifeline)) {
    return state; // Already used
  }

  const newState = { ...state };
  newState.usedLifelines.push(lifeline);

  if (lifeline === 'fiftyFifty' && state.currentQuestion) {
    // Remove 2 incorrect answers
    const correctIndex = state.currentQuestion.correctAnswer;
    const incorrectIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
    // Shuffle and take 2
    const shuffled = incorrectIndices.sort(() => Math.random() - 0.5);
    newState.fiftyFiftyRemovedAnswers = shuffled.slice(0, 2);
  } else if (lifeline === 'audience') {
    newState.audienceVoteActive = true;
  } else if (lifeline === 'friend') {
    newState.friendActive = true;
  } else if (lifeline === 'challenge') {
    newState.challengeActive = true;
  }

  return newState;
}

export function setAudienceVoteResults(state: GameState, results: { [key: number]: number }): GameState {
  const newState = { ...state };
  newState.audienceVoteResults = results;
  return newState;
}

export function setChallengeNumber(state: GameState, number: number): GameState {
  const newState = { ...state };
  newState.challengeSelectedNumber = number;
  return newState;
}

export function acceptChallenge(state: GameState): GameState {
  const newState = { ...state };
  newState.challengeAccepted = true;
  newState.challengeActive = false;
  
  // Auto-pass the question - move to next round
  if (newState.currentRound >= 12) {
    // Won the game!
    newState.status = 'won';
    newState.finalPrize = getPrizeForRound(12);
    // Reset challenge state
    newState.challengeActive = false;
    newState.challengeSelectedNumber = null;
    newState.challengeAccepted = null;
    return newState;
  } else {
    // Move to next round
    return moveToNextRound(newState);
  }
}

export function toggleAudienceResults(state: GameState): GameState {
  const newState = { ...state };
  newState.showAudienceResults = !newState.showAudienceResults;
  return newState;
}

export function playFriendAudio(state: GameState): GameState {
  const newState = { ...state };
  newState.friendAudioPlaying = true;
  return newState;
}

export function stopFriendAudio(state: GameState): GameState {
  const newState = { ...state };
  newState.friendAudioPlaying = false;
  return newState;
}

export function rejectChallenge(state: GameState): GameState {
  const newState = { ...state };
  newState.challengeAccepted = false;
  newState.challengeActive = false;
  return newState;
}

export function endGame(state: GameState): GameState {
  const newState = { ...state };
  newState.status = 'lost';
  
  // Calculate final prize when player withdraws
  // Player keeps the prize they have won (current round prize if they answered correctly)
  // If they haven't answered the current question yet, they keep the previous round prize
  if (newState.currentRound > 0) {
    // If answer was confirmed and correct, player keeps current round prize
    // Otherwise, player keeps previous round prize
    if (newState.answerConfirmed && newState.isAnswerCorrect === true) {
      // Player answered correctly - they keep the current round prize
      newState.finalPrize = getPrizeForRound(newState.currentRound);
    } else {
      // Player withdraws before answering or after wrong answer - keep previous round prize
      newState.finalPrize = getPrizeForRound(newState.currentRound - 1);
    }
  } else {
    // Game ended before first question
    newState.finalPrize = 0;
  }
  
  return newState;
}

