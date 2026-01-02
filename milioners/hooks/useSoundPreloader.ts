'use client';

import { useEffect, useState } from 'react';
import { soundManager } from '@/lib/sounds';

export function useSoundPreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSounds = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await soundManager.preloadAll();
        
        if (mounted) {
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load sounds');
          setIsLoading(false);
        }
      }
    };

    loadSounds();

    return () => {
      mounted = false;
    };
  }, []);

  return { isLoading, isLoaded, error };
}
