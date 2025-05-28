'use client';

import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import PixelArtPreview from './components/PixelArtPreview';
import Controls from './components/Controls';

export default function Home() {
  const [image, setImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [colorCount, setColorCount] = useState(32);
  const [saturation, setSaturation] = useState(1);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        ピクセルアート変換ツール
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <ImageUploader onImageUpload={setImage} />
        
        {image && (
          <>
            <Controls
              pixelSize={pixelSize}
              colorCount={colorCount}
              saturation={saturation}
              onPixelSizeChange={setPixelSize}
              onColorCountChange={setColorCount}
              onSaturationChange={setSaturation}
            />
            
            <PixelArtPreview
              image={image}
              pixelSize={pixelSize}
              colorCount={colorCount}
              saturation={saturation}
            />
          </>
        )}
      </div>
    </main>
  );
}