// Vote storage using Redis
import { getRedisClient } from './redis-client';

const VOTES_PREFIX = 'milioners:votes:';
const VOTERS_PREFIX = 'milioners:voters:';

// Fallback in-memory storage if Redis is unavailable
const votesStore: { [gameId: string]: { [answerIndex: number]: number; voters: Set<string> } } = {};

function getVotesKey(gameId: string): string {
  return `${VOTES_PREFIX}${gameId}`;
}

function getVotersKey(gameId: string): string {
  return `${VOTERS_PREFIX}${gameId}`;
}

export async function getVotesForGame(gameId: string): Promise<{ [answerIndex: number]: number } | null> {
  console.log('getVotesForGame called for gameId:', gameId);
  
  try {
    const client = await getRedisClient();
    if (client) {
      const votesKey = getVotesKey(gameId);
      const votesData = await client.get(votesKey);
      
      if (votesData) {
        const votes = JSON.parse(votesData);
        console.log('Votes found in Redis:', votes);
        return votes;
      }
      
      console.log('No votes found in Redis for gameId:', gameId);
      return null;
    }
  } catch (error) {
    console.error('Error getting votes from Redis, falling back to memory:', error);
  }
  
  // Fallback to memory
  const votes = votesStore[gameId];
  if (!votes) {
    console.log('No votes found in memory for gameId:', gameId);
    return null;
  }
  
  const results: { [answerIndex: number]: number } = {};
  for (const [key, value] of Object.entries(votes)) {
    if (key !== 'voters' && typeof value === 'number') {
      results[parseInt(key)] = value;
    }
  }
  
  console.log('Returning results from memory:', results);
  return results;
}

export async function addVote(gameId: string, answerIndex: number, voterId: string): Promise<boolean> {
  console.log('addVote called:', { gameId, answerIndex, voterId });
  
  try {
    const client = await getRedisClient();
    if (client) {
      const votersKey = getVotersKey(gameId);
      const votesKey = getVotesKey(gameId);
      
      // Check if voter already voted
      const hasVoted = await client.sIsMember(votersKey, voterId);
      if (hasVoted) {
        console.log('Voter already voted:', voterId);
        return false;
      }
      
      // Add voter to set
      await client.sAdd(votersKey, voterId);
      
      // Get current votes
      const votesData = await client.get(votesKey);
      const votes: { [answerIndex: number]: number } = votesData ? JSON.parse(votesData) : {};
      
      // Increment vote count
      votes[answerIndex] = (votes[answerIndex] || 0) + 1;
      
      // Save votes
      await client.set(votesKey, JSON.stringify(votes));
      
      console.log('Vote added to Redis. Current votes:', votes);
      return true;
    }
  } catch (error) {
    console.error('Error adding vote to Redis, falling back to memory:', error);
  }
  
  // Fallback to memory
  if (!votesStore[gameId]) {
    votesStore[gameId] = { voters: new Set() };
    console.log('Created new vote store for gameId:', gameId);
  }
  
  const votes = votesStore[gameId];
  
  // Check if voter already voted
  if (votes.voters.has(voterId)) {
    console.log('Voter already voted:', voterId);
    return false;
  }
  
  // Add vote
  votes.voters.add(voterId);
  votes[answerIndex] = (votes[answerIndex] || 0) + 1;
  
  console.log('Vote added to memory. Current votes:', votes);
  return true;
}

export async function clearVotesForGame(gameId: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client) {
      const votesKey = getVotesKey(gameId);
      const votersKey = getVotersKey(gameId);
      await client.del(votesKey);
      await client.del(votersKey);
      return;
    }
  } catch (error) {
    console.error('Error clearing votes from Redis:', error);
  }
  
  // Fallback
  delete votesStore[gameId];
}

