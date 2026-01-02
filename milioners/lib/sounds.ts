// Sound preloader and manager for the game

const soundPaths = {
  intro: '/sounds/intro.mp3',
  newQuestion: '/sounds/new-question.mp3',
  correctAnswer: '/sounds/correct-answer.mp3',
  wrongAnswer: '/sounds/wrong-answer.mp3',
  audienceVote: '/sounds/audience-vote.mp3',
};

type SoundKey = keyof typeof soundPaths;

class SoundManager {
  private sounds: Map<SoundKey, HTMLAudioElement> = new Map();
  private loaded: Set<SoundKey> = new Set();
  private loading: Set<SoundKey> = new Set();

  async preloadAll(): Promise<void> {
    const promises = Object.keys(soundPaths).map((key) => 
      this.preloadSound(key as SoundKey)
    );
    await Promise.all(promises);
  }

  private async preloadSound(key: SoundKey): Promise<void> {
    if (this.loaded.has(key) || this.loading.has(key)) {
      return;
    }

    this.loading.add(key);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio(soundPaths[key]);
      
      // Preload the audio
      audio.preload = 'auto';
      
      const handleCanPlay = () => {
        this.sounds.set(key, audio);
        this.loaded.add(key);
        this.loading.delete(key);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = () => {
        this.loading.delete(key);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        console.warn(`Failed to preload sound: ${key}`);
        // Don't reject - just log warning, so other sounds can still load
        resolve();
      };

      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      
      // Try to load the audio
      audio.load();
    });
  }

  play(key: SoundKey, volume: number = 1.0): void {
    try {
      const audio = this.sounds.get(key);
      
      if (audio && audio.readyState >= 2) {
        // Audio is preloaded and ready - create new instance for simultaneous playback
        const newAudio = new Audio(soundPaths[key]);
        newAudio.volume = volume;
        newAudio.play().catch((error) => {
          console.error(`Error playing preloaded sound ${key}:`, error);
          // Fallback to direct play
          audio.currentTime = 0;
          audio.volume = volume;
          audio.play().catch((err) => {
            console.error(`Error playing fallback sound ${key}:`, err);
          });
        });
      } else if (audio) {
        // Audio exists but not ready - reset and play
        audio.currentTime = 0;
        audio.volume = volume;
        audio.play().catch((error) => {
          console.error(`Error playing sound ${key}:`, error);
        });
      } else {
        // Fallback: create new audio if not preloaded
        console.warn(`Sound ${key} not preloaded, loading on demand...`);
        const fallbackAudio = new Audio(soundPaths[key]);
        fallbackAudio.volume = volume;
        fallbackAudio.play().catch((error) => {
          console.error(`Error playing fallback sound ${key}:`, error);
        });
      }
    } catch (error) {
      console.error(`Unexpected error playing sound ${key}:`, error);
    }
  }

  stop(key: SoundKey): void {
    const audio = this.sounds.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  stopAll(): void {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  isLoaded(key: SoundKey): boolean {
    return this.loaded.has(key);
  }

  areAllLoaded(): boolean {
    return Object.keys(soundPaths).every(key => this.loaded.has(key as SoundKey));
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Export sound keys for type safety
export type { SoundKey };
export { soundPaths };
