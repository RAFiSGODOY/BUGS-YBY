import { useState, useRef } from 'react';
import { Camera, X, Download, RotateCcw } from 'lucide-react';

interface ScreenshotCaptureProps {
  onScreenshot: (base64: string) => void;
  currentScreenshot?: string;
  disabled?: boolean;
}

export function ScreenshotCapture({ onScreenshot, currentScreenshot, disabled }: ScreenshotCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentScreenshot || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onScreenshot(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onScreenshot('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetake = () => {
    handleRemove();
    setTimeout(() => handleCapture(), 100);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        📸 Screenshot do Bug
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <img
              src={preview}
              alt="Screenshot preview"
              className="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleRetake}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              Nova Foto
            </button>
            
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              Remover
            </button>
            
            <a
              href={preview}
              download="bug-screenshot.png"
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              Baixar
            </a>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">
            Capture uma foto do bug para facilitar a identificação
          </p>
          
          <button
            type="button"
            onClick={handleCapture}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mx-auto"
          >
            <Camera className="h-4 w-4" />
            {isCapturing ? 'Capturando...' : 'Tirar Foto'}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            📱 Funciona melhor em dispositivos móveis
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
