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

export function getRandomQuestionByLevel(level: number, usedQuestionIds: number[] = []): Question | null {
  const availableQuestions = getQuestionsByLevel(level).filter(q => !usedQuestionIds.includes(q.id));
  if (availableQuestions.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

export function getQuestionForRound(round: number, usedQuestionIds: number[] = []): Question | null {
  // Round 1-4: level 1
  // Round 5-8: level 2
  // Round 9-12: level 3
  // Round 13-15: level 4
  let level: number;
  if (round <= 4) {
    level = 1;
  } else if (round <= 8) {
    level = 2;
  } else if (round <= 12) {
    level = 3;
  } else {
    level = 4;
  }
  
  return getRandomQuestionByLevel(level, usedQuestionIds);
}

export const PRIZE_LEVELS = [
  500,
  1000,
  2000,
  5000,
  10000,
  20000,
  40000,
  75000,
  125000,
  250000,
  500000,
  750000,
  1000000,
  1500000,
  2000000
];

export function getPrizeForRound(round: number): number {
  if (round === 0) return 0;
  if (round <= PRIZE_LEVELS.length) {
    return PRIZE_LEVELS[round - 1];
  }
  return PRIZE_LEVELS[PRIZE_LEVELS.length - 1];
}

export function getGuaranteedPrize(round: number): number {
  // Safe havens: round 5 (10,000), round 10 (250,000)
  if (round >= 10) return 250000;
  if (round >= 5) return 10000;
  return 0;
}

