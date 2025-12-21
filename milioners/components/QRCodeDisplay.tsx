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
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <h3 className="text-xl font-bold mb-4">Kod QR do głosowania</h3>
      <div className="flex justify-center mb-4">
        <QRCode value={url} size={size} />
      </div>
      <p className="text-sm text-gray-600 mb-2">Zeskanuj kod, aby zagłosować</p>
      <p className="text-xs text-gray-500">ID Gry: {gameId}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
      >
        Otwórz link głosowania
      </a>
    </div>
  );
}
