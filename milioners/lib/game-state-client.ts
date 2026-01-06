// Client-side game state synchronization
// Syncs state between API and localStorage

import { GameState } from './game-state';
import { saveGameStateToLocal, getGameStateFromLocal } from './game-storage';

// Debounce timer for update requests
let updateDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const UPDATE_DEBOUNCE_MS = 300; // 300ms debounce

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

// Read-only fetch for game screen (no headers, no state sync)
export async function fetchGameStateReadOnly(): Promise<GameState> {
  const response = await fetch('/api/game-state', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  const data = await response.json();
  // Don't save to localStorage - game screen is read-only
  return data;
}

// Fetch with state sync for host panel only
export async function fetchGameState(): Promise<GameState> {
  const headers = getGameStateHeaders();
  const response = await fetch('/api/game-state', {
    method: 'GET',
    headers,
    cache: 'no-store',
  });
  const data = await response.json();
  saveGameStateToLocal(data);
  return data;
}

// Update game state (host only) with debouncing
export async function updateGameState(action: string, params: Record<string, unknown> = {}): Promise<GameState> {
  return new Promise((resolve, reject) => {
    // Clear existing timer
    if (updateDebounceTimer) {
      clearTimeout(updateDebounceTimer);
    }

    // Set new timer
    updateDebounceTimer = setTimeout(async () => {
      try {
        const headers = getGameStateHeaders();
        const response = await fetch('/api/game-state', {
          method: 'POST',
          headers,
          body: JSON.stringify({ action, ...params }),
          cache: 'no-store',
        });
        const data = await response.json();
        saveGameStateToLocal(data);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    }, UPDATE_DEBOUNCE_MS);
  });
}
