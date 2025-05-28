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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-medium mb-2">元の画像</h3>
        <canvas ref={originalCanvasRef} className="w-full" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">ピクセルアート</h3>
        <canvas ref={pixelatedCanvasRef} className="w-full" />
      </div>
    </div>
  );
}

function pixelateImage(imageData, pixelSize, colorCount) {
  const { width, height, data } = imageData;
  const newData = new Uint8ClampedArray(data.length);

  // ピクセル化処理の実装
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // ブロック内の平均色を計算
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;

      for (let blockY = 0; blockY < pixelSize && y + blockY < height; blockY++) {
        for (let blockX = 0; blockX < pixelSize && x + blockX < width; blockX++) {
          const i = ((y + blockY) * width + (x + blockX)) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          a += data[i + 3];
          count++;
        }
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);

      // 色数を制限
      r = Math.round(r / (256 / colorCount)) * (256 / colorCount);
      g = Math.round(g / (256 / colorCount)) * (256 / colorCount);
      b = Math.round(b / (256 / colorCount)) * (256 / colorCount);

      // 新しいデータに書き込み
      for (let blockY = 0; blockY < pixelSize && y + blockY < height; blockY++) {
        for (let blockX = 0; blockX < pixelSize && x + blockX < width; blockX++) {
          const i = ((y + blockY) * width + (x + blockX)) * 4;
          newData[i] = r;
          newData[i + 1] = g;
          newData[i + 2] = b;
          newData[i + 3] = a;
        }
      }
    }
  }

  return new ImageData(newData, width, height);
}