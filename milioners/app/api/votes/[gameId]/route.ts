import { NextRequest, NextResponse } from 'next/server';
import { getVotesForGame } from '@/lib/votes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    
    if (!gameId) {
      console.error('Missing gameId in params');
      return NextResponse.json(
        { error: 'Missing gameId' },
        { status: 400 }
      );
    }

    console.log('Fetching votes for gameId:', gameId);
    const results = getVotesForGame(gameId);
    
    if (!results) {
      console.log('No votes found for gameId:', gameId);
      return NextResponse.json({});
    }

    console.log('Votes found:', results);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error getting votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

