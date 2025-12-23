import { NextRequest, NextResponse } from 'next/server';
import { GameState, createInitialGameState, startGame, selectAnswer, confirmAnswer, moveToNextRound, showNextAnswer, useLifeline, setAudienceVoteResults, setChallengeNumber, acceptChallenge, rejectChallenge, toggleAudienceResults, endGame } from '@/lib/game-state';

// In-memory game state storage
// In production, this should be in a database or Redis
let gameState: GameState | null = null;

export async function GET() {
  if (!gameState) {
    gameState = createInitialGameState();
  }
  return NextResponse.json(gameState);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!gameState) {
      gameState = createInitialGameState();
    }

    switch (action) {
      case 'start':
        gameState = startGame(gameState);
        break;
      
      case 'selectAnswer':
        if (params.answerIndex !== undefined) {
          gameState = selectAnswer(gameState, params.answerIndex);
        }
        break;
      
      case 'confirmAnswer':
        gameState = confirmAnswer(gameState);
        break;
      
      case 'moveToNextRound':
        gameState = moveToNextRound(gameState);
        break;
      
      case 'showNextAnswer':
        gameState = showNextAnswer(gameState);
        break;
      
      case 'useLifeline':
        if (params.lifeline) {
          gameState = useLifeline(gameState, params.lifeline);
        }
        break;
      
      case 'setAudienceVoteResults':
        if (params.results) {
          gameState = setAudienceVoteResults(gameState, params.results);
        }
        break;
      
      case 'setChallengeNumber':
        if (params.number !== undefined) {
          gameState = setChallengeNumber(gameState, params.number);
        }
        break;
      
      case 'acceptChallenge':
        gameState = acceptChallenge(gameState);
        break;
      
      case 'rejectChallenge':
        gameState = rejectChallenge(gameState);
        break;
      
      case 'toggleAudienceResults':
        gameState = toggleAudienceResults(gameState);
        break;
      
      case 'endGame':
        gameState = endGame(gameState);
        break;
      
      case 'reset':
        gameState = createInitialGameState();
        break;
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json(gameState);
  } catch (error) {
    console.error('Error updating game state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


