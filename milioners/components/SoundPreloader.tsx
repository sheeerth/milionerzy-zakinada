'use client';

import { useSoundPreloader } from '@/hooks/useSoundPreloader';

export default function SoundPreloader() {
  useSoundPreloader();
  // This component doesn't render anything, it just preloads sounds
  return null;
}
