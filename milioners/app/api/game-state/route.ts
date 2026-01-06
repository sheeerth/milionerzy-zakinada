import { NextRequest, NextResponse } from 'next/server';
import { GameState, createInitialGameState, startGame, startFirstQuestion, selectAnswer, confirmAnswer, moveToNextRound, showNextAnswer, useLifeline, setAudienceVoteResults, setChallengeNumber, acceptChallenge, rejectChallenge, toggleAudienceResults, endGame } from '@/lib/game-state';
import { resetGameState } from '@/lib/game-storage';

// Persistent game state storage
// Uses localStorage sync on client + server memory as fallback
// On Vercel, each serverless function instance has its own memory,
// so we rely on client sending state in headers
let gameState: GameState | null = null;

// Initialize or get existing state
function getOrCreateState(clientState?: GameState): GameState {
  // Prefer client state if provided (most up-to-date)
  if (clientState && typeof clientState === 'object' && 'status' in clientState) {
    gameState = clientState;
    return clientState;
  }
  
  // Fallback to server memory
  if (!gameState) {
    gameState = createInitialGameState();
  }
  return gameState;
}

export async function GET(request: NextRequest) {
  try {
    // Try to get state from request header (client sync)
    const clientStateHeader = request.headers.get('x-game-state');
    if (clientStateHeader) {
      try {
        const parsed = JSON.parse(clientStateHeader);
        if (parsed && typeof parsed === 'object' && 'status' in parsed) {
          // Use client state (most up-to-date)
          gameState = parsed;
          return NextResponse.json(parsed);
        }
      } catch (e) {
        // Invalid client state, continue with server state
        console.warn('Invalid client state in header:', e);
      }
    }

    // Fallback to server memory state
    const state = getOrCreateState();
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error getting game state:', error);
    const state = createInitialGameState();
    gameState = state;
    return NextResponse.json(state);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // Get current state (try from client first, then server)
    // Client state is always more up-to-date on Vercel serverless
    const clientStateHeader = request.headers.get('x-game-state');
    let currentState: GameState;
    
    if (clientStateHeader) {
      try {
        const parsed = JSON.parse(clientStateHeader);
        if (parsed && typeof parsed === 'object' && 'status' in parsed) {
          currentState = parsed;
        } else {
          currentState = getOrCreateState();
        }
      } catch (e) {
        console.warn('Invalid client state in header:', e);
        currentState = getOrCreateState();
      }
    } else {
      currentState = getOrCreateState();
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
        newState = await resetGameState();
        break;
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Save state to server memory (for this instance)
    gameState = newState;

    return NextResponse.json(newState);
  } catch (error) {
    console.error('Error updating game state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


