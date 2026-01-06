import { NextRequest, NextResponse } from 'next/server';
import { addVote } from '@/lib/votes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, answerIndex, voterId } = body;

    console.log('Vote received:', { gameId, answerIndex, voterId });

    if (!gameId || answerIndex === undefined || !voterId) {
      console.error('Missing required fields:', { gameId, answerIndex, voterId });
      return NextResponse.json(
        { error: 'Missing required fields: gameId, answerIndex, voterId' },
        { status: 400 }
      );
    }

    if (answerIndex < 0 || answerIndex > 3) {
      return NextResponse.json(
        { error: 'Invalid answerIndex. Must be 0-3' },
        { status: 400 }
      );
    }

    const success = await addVote(gameId, answerIndex, voterId);

    if (!success) {
      console.log('Vote rejected - already voted:', voterId);
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 409 }
      );
    }

    console.log('Vote added successfully for gameId:', gameId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

