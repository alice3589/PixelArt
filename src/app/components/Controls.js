'use client';

export default function Controls({
    pixelSize,
    colorCount,
    saturation,
    onPixelSizeChange,
    onColorCountChange,
    onSaturationChange
  }) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ピクセルサイズ: {pixelSize}
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={pixelSize}
              onChange={(e) => onPixelSizeChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              色数: {colorCount}
            </label>
            <input
              type="range"
              min="2"
              max="256"
              value={colorCount}
              onChange={(e) => onColorCountChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              彩度: {saturation.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={saturation}
              onChange={(e) => onSaturationChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }