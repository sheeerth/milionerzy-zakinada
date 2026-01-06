'use client';

import { useState } from 'react';

interface HostLoginProps {
  onLogin: () => void;
}

export default function HostLogin({ onLogin }: HostLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple password check - in production, this should be server-side
    // For now, using a default password (can be changed via env variable)
    const correctPassword = process.env.NEXT_PUBLIC_HOST_PASSWORD || 'admin123';

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    if (password === correctPassword) {
      // Store login state in localStorage
      localStorage.setItem('host_authenticated', 'true');
      localStorage.setItem('host_auth_timestamp', Date.now().toString());
      onLogin();
    } else {
      setError('Nieprawidłowe hasło');
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#000428] to-[#001a4d] flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] rounded-xl shadow-2xl p-12 max-w-md w-full border-4 border-[#FFD700]">
        <h1 className="text-4xl font-black mb-8 text-[#FFD700] tracking-wider uppercase text-center drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">
          Panel Prowadzącego
        </h1>
        <p className="text-xl text-white mb-6 font-bold text-center">
          Wprowadź hasło, aby uzyskać dostęp
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              className="w-full bg-gradient-to-r from-[#001a4d] to-[#000428] border-2 border-[#FFD700] text-white placeholder-gray-400 px-6 py-4 rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD700]/50 transition-all"
              autoFocus
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="bg-red-600/20 border-2 border-red-500 rounded-xl p-4">
              <p className="text-red-400 font-bold text-center">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.8)]"
          >
            {isLoading ? 'Sprawdzanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
