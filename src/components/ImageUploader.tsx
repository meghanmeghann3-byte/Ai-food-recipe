import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Sparkles, RefreshCw, AlertCircle, FileCheck } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
  onSwitchToCamera: () => void;
  isAnalyzing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onSwitchToCamera,
  isAnalyzing,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeKb: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
      setErrorMsg('Unsupported format. Please upload a JPEG, PNG, or WebP food photo.');
      return;
    }

    // Limit to 15MB
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg('File size exceeds 15MB limit. Please upload a smaller image.');
      return;
    }

    setFileDetails({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.onerror = () => {
      setErrorMsg('Error reading image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileDetails(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    if (previewUrl) {
      onImageSelected(previewUrl);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-[#E3ECE5] shadow-xl overflow-hidden transition-all">
      {/* Header */}
      <div className="bg-[#2D5A3C] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Upload className="w-5 h-5 text-[#88D49E]" />
          </div>
          <div>
            <h3 className="font-semibold text-base tracking-tight">Upload Food Image</h3>
            <p className="text-xs text-[#E3ECE5]/90">JPEG, PNG, or WebP from your device</p>
          </div>
        </div>

        <button
          onClick={onSwitchToCamera}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 transition cursor-pointer text-white"
        >
          <Camera className="w-3.5 h-3.5 text-[#88D49E]" />
          <span>Switch to Camera</span>
        </button>
      </div>

      <div className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#2D5A3C] bg-[#F4F9F5]'
                : 'border-[#CBD5CD] hover:border-[#2D5A3C] hover:bg-[#FAF7F2]'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-[#1E2922] mb-1">
              Click to select or drag & drop food photo
            </h4>
            <p className="text-xs sm:text-sm text-[#5B6D61] mb-3">
              Photographs of produce, pantry items, leftover cooked meals, or ingredients
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#E8F3EB] text-[#2D5A3C]">
              Supports JPG, PNG, WebP up to 15MB
            </span>

            {/* Quick Test Samples */}
            <div className="mt-6 pt-5 border-t border-[#E3ECE5]">
              <span className="text-xs font-semibold text-[#5B6D61] block mb-2.5">
                Or test instantly with a sample food photo:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  {
                    name: 'Fresh Red Tomato',
                    path: '/src/assets/images/ripe_red_tomato_1793097136506.jpg',
                  },
                  {
                    name: 'Ripe Bananas',
                    path: '/src/assets/images/ripe_yellow_banana_1793097187739.jpg',
                  },
                  {
                    name: 'Indian Lemon Rice',
                    path: '/src/assets/images/indian_lemon_rice_1793097218219.jpg',
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const res = await fetch(sample.path);
                        const blob = await res.blob();
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const base64 = ev.target?.result as string;
                          setPreviewUrl(base64);
                          setFileDetails({
                            name: `${sample.name}.jpg`,
                            sizeKb: Math.round(blob.size / 1024),
                          });
                        };
                        reader.readAsDataURL(blob);
                      } catch (err) {
                        console.warn('Could not load sample image:', err);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#CBD5CD] text-xs font-semibold text-[#2D5A3C] transition cursor-pointer shadow-xs"
                  >
                    🌱 {sample.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#E3ECE5] bg-black/5 aspect-[4/3] flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected Food Preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fileDetails && (
              <div className="flex items-center justify-between text-xs text-[#5B6D61] bg-[#FAF7F2] p-3 rounded-xl border border-[#E3ECE5]">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-[#2D5A3C]" />
                  <span className="font-medium text-[#1E2922] truncate">{fileDetails.name}</span>
                </div>
                <span className="shrink-0">{fileDetails.sizeKb} KB</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {previewUrl && (
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="px-4 py-3 rounded-xl border border-[#CBD5CD] text-[#2D5A3C] hover:bg-[#FAF7F2] font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              Replace Photo
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white font-bold text-sm sm:text-base transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#88D49E]" />
                  <span>Gemini Vision is Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#88D49E]" />
                  <span>Analyze Food with Gemini</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
