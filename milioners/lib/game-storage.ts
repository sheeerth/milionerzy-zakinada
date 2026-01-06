// Game state storage utilities
// This file is kept for potential future use with Vercel KV or database
// Currently, state is synced via localStorage on client and headers in API calls

import { GameState, createInitialGameState } from './game-state';

const STORAGE_KEY = 'milioners_game_state';

// Client-side localStorage helpers
export function saveGameStateToLocal(state: GameState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getGameStateFromLocal(): GameState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && 'status' in parsed) {
        return parsed as GameState;
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return null;
}

export async function resetGameState(): Promise<GameState> {
  const newState = createInitialGameState();
  saveGameStateToLocal(newState);
  return newState;
}
