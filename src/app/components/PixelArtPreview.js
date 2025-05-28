'use client';

import { useEffect, useRef } from 'react';

export default function PixelArtPreview({ image, pixelSize, colorCount }) {
  const originalCanvasRef = useRef(null);
  const pixelatedCanvasRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      const originalCanvas = originalCanvasRef.current;
      const pixelatedCanvas = pixelatedCanvasRef.current;
      
      // キャンバスのサイズを設定
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;
      pixelatedCanvas.width = img.width;
      pixelatedCanvas.height = img.height;

      // 元の画像を描画
      const originalCtx = originalCanvas.getContext('2d');
      originalCtx.drawImage(img, 0, 0);

      // ピクセル化処理
      const imageData = originalCtx.getImageData(0, 0, img.width, img.height);
      const pixelatedData = pixelateImage(imageData, pixelSize, colorCount);
      
      // ピクセル化された画像を描画
      const pixelatedCtx = pixelatedCanvas.getContext('2d');
      pixelatedCtx.putImageData(pixelatedData, 0, 0);
    };
    img.src = image;
  }, [image, pixelSize, colorCount]);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-medium mb-2">元の画像</h3>
        <canvas ref={originalCanvasRef} className="w-full" />
      </div>
      
      {/* 矢印 */}
      <div className="flex items-center justify-center">
        <svg
          className="w-16 h-16 text-black-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-medium mb-2">ピクセルアート</h3>
        <canvas ref={pixelatedCanvasRef} className="w-full" />
      </div>
    </div>
  );
}

// pixelateImage関数は変更なし