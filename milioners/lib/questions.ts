import questionsData from '@/data/questions.json';

export interface Question {
  id: number;
  question: string;
  answers: string[];
  correctAnswer: number;
  lvl: number;
  voiceFile: string;
}

export interface QuestionsData {
  questions: Question[];
}

const questions = (questionsData as QuestionsData).questions;

export function getQuestionsByLevel(level: number): Question[] {
  return questions.filter(q => q.lvl === level);
}

// Fisher-Yates shuffle algorithm for better randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomQuestionByLevel(level: number, usedQuestionIds: number[] = []): Question | null {
  const availableQuestions = getQuestionsByLevel(level).filter(q => !usedQuestionIds.includes(q.id));
  if (availableQuestions.length === 0) return null;
  
  // Shuffle available questions for better randomization
  // This ensures more even distribution across multiple games
  const shuffledQuestions = shuffleArray(availableQuestions);
  
  // Use crypto.getRandomValues if available for better randomness, otherwise fall back to Math.random
  let randomIndex: number;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    randomIndex = randomArray[0] % shuffledQuestions.length;
  } else {
    randomIndex = Math.floor(Math.random() * shuffledQuestions.length);
  }
  
  return shuffledQuestions[randomIndex];
}

export function getQuestionForRound(round: number, usedQuestionIds: number[] = []): Question | null {
  // Round 1-3: level 1
  // Round 4-6: level 2
  // Round 7-9: level 3
  // Round 10-12: level 4
  let level: number;
  if (round <= 3) {
    level = 1;
  } else if (round <= 6) {
    level = 2;
  } else if (round <= 9) {
    level = 3;
  } else {
    level = 4;
  }
  
  return getRandomQuestionByLevel(level, usedQuestionIds);
}

export const PRIZE_LEVELS = [
  1000,    // Round 1
  2000,    // Round 2 - safe haven
  5000,    // Round 3
  10000,   // Round 4
  15000,   // Round 5
  25000,   // Round 6
  40000,   // Round 7 - safe haven
  75000,   // Round 8
  125000,  // Round 9
  250000,  // Round 10
  500000,  // Round 11
  1000000  // Round 12
];

export function getPrizeForRound(round: number): number {
  if (round === 0) return 0;
  if (round <= PRIZE_LEVELS.length) {
    return PRIZE_LEVELS[round - 1];
  }
  return PRIZE_LEVELS[PRIZE_LEVELS.length - 1];
}

export function getGuaranteedPrize(round: number): number {
  // Safe havens: round 2 (2,000), round 7 (50,000)
  if (round >= 7) return 40000;
  if (round >= 2) return 2000;
  return 0;
}

export function getSafeHavenPrize(round: number): number {
  // Returns the safe haven prize for the given round
  // Safe havens are at rounds 2 and 7
  // If round is 7 or higher, return 50,000 (round 7 prize)
  // If round is 2 or higher (but less than 7), return 2,000 (round 2 prize)
  // Otherwise return 0
  if (round >= 7) return 40000;
  if (round >= 2) return 2000;
  return 0;
}

