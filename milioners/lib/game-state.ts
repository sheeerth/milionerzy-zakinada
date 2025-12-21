import { Question, getQuestionForRound, getPrizeForRound } from './questions';
import { v4 as uuidv4 } from 'uuid';

export type LifelineType = 'fiftyFifty' | 'audience' | 'friend' | 'challenge';
export type GameStatus = 'not_started' | 'in_progress' | 'won' | 'lost';

export interface GameState {
  gameId: string;
  status: GameStatus;
  currentRound: number;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  usedQuestionIds: number[];
  usedLifelines: LifelineType[];
  fiftyFiftyRemovedAnswers: number[]; // Indices of removed answers
  audienceVoteActive: boolean;
  audienceVoteResults: { [key: number]: number } | null; // answer index -> vote count
  showAudienceResults: boolean; // Whether to show results instead of QR code
  friendActive: boolean; // Whether friend lifeline is currently active
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
    usedQuestionIds: [],
    usedLifelines: [],
    fiftyFiftyRemovedAnswers: [],
    audienceVoteActive: false,
    audienceVoteResults: null,
    showAudienceResults: false,
    friendActive: false,
    challengeActive: false,
    challengeSelectedNumber: null,
    challengeAccepted: null,
    finalPrize: 0,
  };
}

export function startGame(state: GameState): GameState {
  const newState = { ...state };
  newState.status = 'in_progress';
  newState.currentRound = 1;
  newState.currentQuestion = getQuestionForRound(1, []);
  if (newState.currentQuestion) {
    newState.usedQuestionIds.push(newState.currentQuestion.id);
  }
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
  const isCorrect = state.selectedAnswer === state.currentQuestion.correctAnswer;

  if (isCorrect) {
    // Move to next round
    if (newState.currentRound >= 15) {
      // Won the game!
      newState.status = 'won';
      newState.finalPrize = getPrizeForRound(15);
    } else {
      newState.currentRound += 1;
      newState.currentQuestion = getQuestionForRound(newState.currentRound, newState.usedQuestionIds);
      if (newState.currentQuestion) {
        newState.usedQuestionIds.push(newState.currentQuestion.id);
      }
      newState.selectedAnswer = null;
      newState.fiftyFiftyRemovedAnswers = [];
      newState.audienceVoteActive = false;
      newState.audienceVoteResults = null;
      newState.showAudienceResults = false;
      newState.friendActive = false;
      newState.challengeActive = false;
      newState.challengeSelectedNumber = null;
      newState.challengeAccepted = null;
    }
  } else {
    // Wrong answer - game over
    newState.status = 'lost';
    newState.finalPrize = getPrizeForRound(newState.currentRound - 1);
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
  if (newState.currentRound >= 15) {
    // Won the game!
    newState.status = 'won';
    newState.finalPrize = getPrizeForRound(15);
    // Reset challenge state
    newState.challengeActive = false;
    newState.challengeSelectedNumber = null;
    newState.challengeAccepted = null;
  } else {
    // Move to next round
    newState.currentRound += 1;
    newState.currentQuestion = getQuestionForRound(newState.currentRound, newState.usedQuestionIds);
    if (newState.currentQuestion) {
      newState.usedQuestionIds.push(newState.currentQuestion.id);
    }
    // Reset all question-related state
    newState.selectedAnswer = null;
    newState.fiftyFiftyRemovedAnswers = [];
    newState.audienceVoteActive = false;
    newState.audienceVoteResults = null;
    newState.showAudienceResults = false;
    newState.friendActive = false;
    // Reset challenge state for next question
    newState.challengeActive = false;
    newState.challengeSelectedNumber = null;
    newState.challengeAccepted = null;
  }
  
  return newState;
}

export function toggleAudienceResults(state: GameState): GameState {
  const newState = { ...state };
  newState.showAudienceResults = !newState.showAudienceResults;
  return newState;
}

export function rejectChallenge(state: GameState): GameState {
  const newState = { ...state };
  newState.challengeAccepted = false;
  newState.challengeActive = false;
  return newState;
}

