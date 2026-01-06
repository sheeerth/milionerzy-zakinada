// Client-side game state synchronization
// Syncs state between API and localStorage

import { GameState } from './game-state';
import { saveGameStateToLocal, getGameStateFromLocal } from './game-storage';

export function getGameStateHeaders(): HeadersInit {
  const localState = getGameStateFromLocal();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (localState) {
    headers['x-game-state'] = JSON.stringify(localState);
  }
  
  return headers;
}

export async function fetchGameState(): Promise<GameState> {
  const headers = getGameStateHeaders();
  const response = await fetch('/api/game-state', {
    method: 'GET',
    headers,
  });
  const data = await response.json();
  saveGameStateToLocal(data);
  return data;
}

export async function updateGameState(action: string, params: any = {}): Promise<GameState> {
  const headers = getGameStateHeaders();
  const response = await fetch('/api/game-state', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...params }),
  });
  const data = await response.json();
  saveGameStateToLocal(data);
  return data;
}
