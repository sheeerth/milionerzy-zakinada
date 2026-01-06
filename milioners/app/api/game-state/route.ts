import { NextRequest, NextResponse } from 'next/server';
import { GameState, createInitialGameState, startGame, startFirstQuestion, selectAnswer, confirmAnswer, moveToNextRound, showNextAnswer, useLifeline, setAudienceVoteResults, setChallengeNumber, acceptChallenge, rejectChallenge, toggleAudienceResults, endGame } from '@/lib/game-state';
import { getGameStateFromRedis, saveGameStateToRedis, resetGameStateInRedis } from '@/lib/redis-client';

// Persistent game state storage using Redis
// Falls back to in-memory if Redis is unavailable
let memoryState: GameState | null = null;

// Initialize or get existing state from Redis
async function getOrCreateState(clientState?: GameState): Promise<GameState> {
  // Prefer client state if provided (most up-to-date for this request)
  if (clientState && typeof clientState === 'object' && 'status' in clientState) {
    // Still save to Redis for persistence
    await saveGameStateToRedis(clientState);
    memoryState = clientState;
    return clientState;
  }
  
  // Try to get from Redis first
  try {
    const redisState = await getGameStateFromRedis();
    if (redisState) {
      memoryState = redisState;
      return redisState;
    }
  } catch (error) {
    console.error('Error getting state from Redis:', error);
  }
  
  // Fallback to memory state
  if (memoryState) {
    return memoryState;
  }
  
  // Create new state
  const newState = createInitialGameState();
  memoryState = newState;
  await saveGameStateToRedis(newState);
  return newState;
}

// Helper function to decode base64 game state from header
function decodeGameStateHeader(headerValue: string): GameState | null {
  try {
    // Decode base64 with UTF-8 support
    const utf8String = decodeURIComponent(escape(atob(headerValue)));
    const parsed = JSON.parse(utf8String);
    if (parsed && typeof parsed === 'object' && 'status' in parsed) {
      return parsed as GameState;
    }
  } catch (e) {
    console.warn('Error decoding game state from header:', e);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Try to get state from request header (client sync - for immediate response)
    const clientStateHeader = request.headers.get('x-game-state');
    if (clientStateHeader) {
      const decodedState = decodeGameStateHeader(clientStateHeader);
      if (decodedState) {
        // Use client state but also sync to Redis in background
        saveGameStateToRedis(decodedState).catch(err => 
          console.error('Error syncing client state to Redis:', err)
        );
        return NextResponse.json(decodedState);
      }
    }

    // Get state from Redis (or create new)
    const state = await getOrCreateState();
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error getting game state:', error);
    const state = createInitialGameState();
    memoryState = state;
    await saveGameStateToRedis(state).catch(() => {});
    return NextResponse.json(state);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // Get current state (try from client first, then Redis, then memory)
    const clientStateHeader = request.headers.get('x-game-state');
    let currentState: GameState;
    
    if (clientStateHeader) {
      const decodedState = decodeGameStateHeader(clientStateHeader);
      if (decodedState) {
        currentState = decodedState;
      } else {
        currentState = await getOrCreateState();
      }
    } else {
      currentState = await getOrCreateState();
    }

    // Apply action
    let newState: GameState;
    switch (action) {
      case 'start':
        newState = startGame(currentState);
        break;
      
      case 'startFirstQuestion':
        newState = startFirstQuestion(currentState);
        break;
      
      case 'selectAnswer':
        if (params.answerIndex !== undefined) {
          newState = selectAnswer(currentState, params.answerIndex);
        } else {
          newState = currentState;
        }
        break;
      
      case 'confirmAnswer':
        newState = confirmAnswer(currentState);
        break;
      
      case 'moveToNextRound':
        newState = moveToNextRound(currentState);
        break;
      
      case 'showNextAnswer':
        newState = showNextAnswer(currentState);
        break;
      
      case 'useLifeline':
        if (params.lifeline) {
          newState = useLifeline(currentState, params.lifeline);
        } else {
          newState = currentState;
        }
        break;
      
      case 'setAudienceVoteResults':
        if (params.results) {
          newState = setAudienceVoteResults(currentState, params.results);
        } else {
          newState = currentState;
        }
        break;
      
      case 'setChallengeNumber':
        if (params.number !== undefined) {
          newState = setChallengeNumber(currentState, params.number);
        } else {
          newState = currentState;
        }
        break;
      
      case 'acceptChallenge':
        newState = acceptChallenge(currentState);
        break;
      
      case 'rejectChallenge':
        newState = rejectChallenge(currentState);
        break;
      
      case 'toggleAudienceResults':
        newState = toggleAudienceResults(currentState);
        break;
      
      case 'endGame':
        newState = endGame(currentState);
        break;
      
      case 'reset':
        newState = await resetGameStateInRedis();
        break;
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Save state to Redis and memory
    memoryState = newState;
    await saveGameStateToRedis(newState);

    return NextResponse.json(newState);
  } catch (error) {
    console.error('Error updating game state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


