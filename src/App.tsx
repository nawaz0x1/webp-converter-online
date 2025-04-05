import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, Info } from 'lucide-react';

type ImageFormat = 'jpeg' | 'jpg' | 'png';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setConvertedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">
              WebP Image Converter
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Convert your WebP images to JPEG, JPG, or PNG format instantly. 
              Free, secure, and processed entirely in your browser - no uploads needed!
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Upload Section with Drag & Drop */}
            <div 
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-colors ${isDragging 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-500'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-gray-400 mb-2 md:mb-4" />
              <p className="text-sm sm:text-base text-gray-600">
                {isDragging ? 'Drop your WebP image here' : 'Click to upload or drag and drop a WebP image'}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
                Supported input format: WebP
              </p>
            </div>

            {/* Conversion Options */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-gray-700 font-medium text-sm sm:text-base sm:min-w-32">Output Format:</label>
                <div className="flex gap-2 sm:gap-4">
                  {(['jpeg', 'jpg', 'png'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg uppercase text-sm sm:text-base ${
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

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-gray-700 font-medium text-sm sm:text-base sm:min-w-32">Quality:</label>
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
                <span className="text-gray-600 min-w-12 text-sm sm:text-base">{quality}%</span>
              </div>
            </div>

            {/* Preview Section */}
            {selectedImage && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Original (WebP)</p>
                    <img 
                      src={selectedImage} 
                      alt="Original" 
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                      Converted ({selectedFormat.toUpperCase()})
                    </p>
                    {convertedImage ? (
                      <img 
                        src={convertedImage} 
                        alt="Converted" 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <div className="h-40 sm:h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={convertImage}
                    disabled={isLoading || !selectedImage}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    {isLoading ? 'Converting...' : `Convert to ${selectedFormat.toUpperCase()}`}
                  </button>
                  {convertedImage && (
                    <button
                      onClick={downloadImage}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
                    >
                      <Download className="w-4 h-4" />
                      Download {selectedFormat.toUpperCase()}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mx-auto sm:mx-0 sm:mt-1" />
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center sm:text-left">Why Choose Our Converter?</h2>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-600">
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

        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
          <p>© 2025 WebP Image Converter. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;