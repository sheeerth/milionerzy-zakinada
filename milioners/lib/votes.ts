// In-memory vote storage
// In production, this should be in a database or Redis
const votesStore: { [gameId: string]: { [answerIndex: number]: number; voters: Set<string> } } = {};

export function getVotesForGame(gameId: string): { [answerIndex: number]: number } | null {
  console.log('getVotesForGame called for gameId:', gameId);
  console.log('Current votesStore keys:', Object.keys(votesStore));
  
  const votes = votesStore[gameId];
  if (!votes) {
    console.log('No votes found for gameId:', gameId);
    return null;
  }
  
  const results: { [answerIndex: number]: number } = {};
  for (const [key, value] of Object.entries(votes)) {
    if (key !== 'voters' && typeof value === 'number') {
      results[parseInt(key)] = value;
    }
  }
  
  console.log('Returning results:', results);
  return results;
}

export function addVote(gameId: string, answerIndex: number, voterId: string): boolean {
  console.log('addVote called:', { gameId, answerIndex, voterId });
  
  if (!votesStore[gameId]) {
    votesStore[gameId] = { voters: new Set() };
    console.log('Created new vote store for gameId:', gameId);
  }
  
  const votes = votesStore[gameId];
  
  // Check if voter already voted
  if (votes.voters.has(voterId)) {
    console.log('Voter already voted:', voterId);
    return false; // Already voted
  }
  
  // Add vote
  votes.voters.add(voterId);
  votes[answerIndex] = (votes[answerIndex] || 0) + 1;
  
  console.log('Vote added. Current votes:', votes);
  return true;
}

export function clearVotesForGame(gameId: string): void {
  delete votesStore[gameId];
}

