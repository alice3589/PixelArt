'use client';

import { useEffect, useRef, useState } from 'react';
import GIF from 'gif.js';
import { parseGIF, decompressFrames } from 'gifuct-js';

// ピクセル化処理の関数をコンポーネントの外に定義
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

export default function PixelArtPreview({ image, pixelSize, colorCount }) {
  const originalCanvasRef = useRef(null);
  const pixelatedCanvasRef = useRef(null);
  const [isGif, setIsGif] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [pixelatedGifUrl, setPixelatedGifUrl] = useState(null);

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

      // GIFかどうかを判定
      const isGifImage = image.toLowerCase().includes('data:image/gif');
      setIsGif(isGifImage);

      if (isGifImage) {
        processGif(image, pixelSize, colorCount);
      } else {
        setProcessingStep('画像を処理中...');
        setIsProcessing(true);
        // 通常の画像処理
        const imageData = originalCtx.getImageData(0, 0, img.width, img.height);
        const pixelatedData = pixelateImage(imageData, pixelSize, colorCount);
        const pixelatedCtx = pixelatedCanvas.getContext('2d');
        pixelatedCtx.putImageData(pixelatedData, 0, 0);
        setIsProcessing(false);
        setProgress(0);
      }
    };
    img.src = image;
  }, [image, pixelSize, colorCount]);

  const processGif = async (gifUrl, pixelSize, colorCount) => {
    setIsProcessing(true);
    setProgress(0);
    setProcessingStep('GIFを読み込み中...');
    
    try {
      const response = await fetch(gifUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        setProcessingStep('フレームを処理中...');
        const arrayBuffer = e.target.result;
        const gif = new GIF({
          workers: 2,
          quality: 10,
          width: originalCanvasRef.current.width,
          height: originalCanvasRef.current.height,
          repeat: 0, // 無限ループ
          dither: false, // ディザリングを無効化
          debug: true, // デバッグ情報を有効化
        });

        // GIFの各フレームを処理
        const frames = await extractGifFrames(arrayBuffer);
        const totalFrames = frames.length;
        
        for (let i = 0; i < frames.length; i++) {
          const frameData = frames[i];
          const pixelatedData = pixelateImage(frameData, pixelSize, colorCount);
          gif.addFrame(pixelatedData, {
            delay: frames[i].delay * 10, // 10ms単位
            copy: true
          });
          
          // 進捗状況を更新
          const newProgress = Math.round((i + 1) / totalFrames * 100);
          setProgress(newProgress);
          setProcessingStep(`フレーム ${i + 1}/${totalFrames} を処理中...`);
        }

        setProcessingStep('GIFを生成中...');
        
        gif.on('progress', (p) => {
          setProgress(Math.round(p * 100));
        });

        gif.on('finished', (blob) => {
          const url = URL.createObjectURL(blob);
          setPixelatedGifUrl(url);
          
          // ピクセル化されたGIFを表示
          const pixelatedCtx = pixelatedCanvasRef.current.getContext('2d');
          const img = new Image();
          img.onload = () => {
            pixelatedCtx.drawImage(img, 0, 0);
            setIsProcessing(false);
            setProgress(0);
            setProcessingStep('');
          };
          img.src = url;
        });

        gif.render();
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error('GIF処理エラー:', error);
      setIsProcessing(false);
      setProgress(0);
      setProcessingStep('');
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (pixelatedGifUrl) {
        URL.revokeObjectURL(pixelatedGifUrl);
      }
    };
  }, [pixelatedGifUrl]);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-medium mb-2">元の画像</h3>
        <canvas ref={originalCanvasRef} className="w-full" />
      </div>
      
      {/* 矢印 */}
      <div className="flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
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
        <div className="relative">
          <canvas ref={pixelatedCanvasRef} className="w-full" />
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
              <div className="text-white mb-2">{processingStep}</div>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-white mt-2">{progress}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// GIFフレーム抽出用の関数を修正
async function extractGifFrames(arrayBuffer) {
  const gif = parseGIF(arrayBuffer);
  const frames = decompressFrames(gif, true); // 全フレームを取得
  // 各フレームのImageDataをcanvasで生成
  const imageDatas = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = gif.lsd.width;
  canvas.height = gif.lsd.height;

  for (const frame of frames) {
    // RGBA配列をImageDataに変換
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    imageData.data.set(frame.patch);
    imageDatas.push(imageData);
  }
  return imageDatas;
}