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
    // Encode state as base64 to avoid ISO-8859-1 encoding issues with special characters
    try {
      const jsonString = JSON.stringify(localState);
      // Use btoa with UTF-8 safe encoding
      const utf8String = unescape(encodeURIComponent(jsonString));
      const base64State = btoa(utf8String);
      headers['x-game-state'] = base64State;
    } catch (error) {
      console.error('Error encoding game state for header:', error);
      // If encoding fails, don't send the header
    }
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

export async function updateGameState(action: string, params: Record<string, unknown> = {}): Promise<GameState> {
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
