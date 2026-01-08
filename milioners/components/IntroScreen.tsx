'use client';

import { useEffect, useState } from 'react';

export default function IntroScreen() {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Show logo after a short delay
    const timer = setTimeout(() => {
      setShowLogo(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,215,0,0.1)_0%,_transparent_70%)]"></div>
      
      <div className="relative z-10 text-center">
        {showLogo && (
          <div className="animate-fade-in">
            <h1 className="text-8xl md:text-9xl font-black text-[#FFD700] tracking-wider uppercase mb-8 drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] animate-pulse-slow">
              MILIONERZY
            </h1>
            <div className="text-2xl md:text-3xl text-white font-bold tracking-wider animate-fade-in-delay">
              Kto chce zostać milionerem?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
