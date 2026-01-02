'use client';

import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  url: string;
  gameId: string;
  large?: boolean; // For game screen display
}

export default function QRCodeDisplay({ url, gameId, large = false }: QRCodeDisplayProps) {
  const size = large ? 400 : 256;
  
  return (
    <div className="bg-gradient-to-br from-[#000428] via-[#001a4d] to-[#000000] p-8 rounded-xl shadow-2xl border-2 border-[#FFD700] text-center">
      <h3 className="text-2xl font-black mb-6 text-[#FFD700] tracking-wider uppercase">Kod QR do głosowania</h3>
      <div className="flex justify-center mb-6 bg-white p-4 rounded-xl">
        <QRCode value={url} size={size} />
      </div>
      <p className="text-lg font-bold text-white mb-3">Zeskanuj kod, aby zagłosować</p>
      <p className="text-sm text-[#FFD700] font-semibold mb-4">ID Gry: {gameId}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFE55C] hover:to-[#FFD700] text-black font-black py-3 px-6 rounded-xl text-lg inline-block transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
      >
        Otwórz link głosowania
      </a>
    </div>
  );
}
