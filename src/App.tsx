import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, Info } from 'lucide-react';

type ImageFormat = 'jpeg' | 'jpg' | 'png';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(90);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setConvertedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const img = new Image();
      img.src = selectedImage;

      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const convertedDataUrl = canvas.toDataURL(`image/${selectedFormat}`, quality / 100);
            setConvertedImage(convertedDataUrl);
          }
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error converting image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;

    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `converted-image.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              WebP Image Converter
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Convert your WebP images to JPEG, JPG, or PNG format instantly. 
              Free, secure, and processed entirely in your browser - no uploads needed!
            </p>
          </div>

          <div className="space-y-6">
            {/* Upload Section */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Click to upload or drag and drop a WebP image
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supported input format: WebP
              </p>
            </div>

            {/* Conversion Options */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium min-w-32">Output Format:</label>
                <div className="flex gap-4">
                  {(['jpeg', 'jpg', 'png'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-lg uppercase ${
                        selectedFormat === format
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium min-w-32">Quality:</label>
                <div className="flex-1">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-gray-600 min-w-12">{quality}%</span>
              </div>
            </div>

            {/* Preview Section */}
            {selectedImage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">Original (WebP)</p>
                    <img 
                      src={selectedImage} 
                      alt="Original" 
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Converted ({selectedFormat.toUpperCase()})
                    </p>
                    {convertedImage ? (
                      <img 
                        src={convertedImage} 
                        alt="Converted" 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={convertImage}
                    disabled={isLoading || !selectedImage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Converting...' : `Convert to ${selectedFormat.toUpperCase()}`}
                  </button>
                  {convertedImage && (
                    <button
                      onClick={downloadImage}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download {selectedFormat.toUpperCase()}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Why Choose Our Converter?</h2>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ 100% free and secure - no registration required</li>
                    <li>✓ Convert WebP images to JPEG, JPG, or PNG format</li>
                    <li>✓ Processed locally in your browser - no file uploads needed</li>
                    <li>✓ Maintain image quality with adjustable compression settings</li>
                    <li>✓ Fast conversion with instant preview</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-600">
          <p>© 2025 WebP Image Converter. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;