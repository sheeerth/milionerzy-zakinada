// Redis client singleton for game state storage
import { createClient } from 'redis';
import { GameState, createInitialGameState } from './game-state';

const REDIS_KEY = 'milioners:game_state';

let redisClient: ReturnType<typeof createClient> | null = null;
let isConnecting = false;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (isConnecting) {
    // Wait for connection to be established
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }
  }

  isConnecting = true;
  
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('REDIS_URL not set, falling back to in-memory storage');
      isConnecting = false;
      return null;
    }

    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    isConnecting = false;
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    isConnecting = false;
    return null;
  }
}

export async function getGameStateFromRedis(): Promise<GameState | null> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return null;
    }

    const data = await client.get(REDIS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && 'status' in parsed) {
        return parsed as GameState;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting game state from Redis:', error);
    return null;
  }
}

export async function saveGameStateToRedis(state: GameState): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return;
    }

    await client.set(REDIS_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state to Redis:', error);
  }
}

export async function resetGameStateInRedis(): Promise<GameState> {
  const newState = createInitialGameState();
  await saveGameStateToRedis(newState);
  return newState;
}

// Close Redis connection (for cleanup)
export async function closeRedisConnection(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}
