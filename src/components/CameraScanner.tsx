import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, StopCircle, Play, Sparkles, AlertCircle, Upload, CheckCircle2, Info, ArrowLeftRight } from 'lucide-react';

interface CameraScannerProps {
  onCaptureComplete: (imageDataUrl: string) => void;
  onSwitchToUpload: () => void;
  isAnalyzing: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCaptureComplete,
  onSwitchToUpload,
  isAnalyzing,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // Default facing mode is "user" (front-facing selfie camera) as required
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraErrorType, setCameraErrorType] = useState<string | null>(null);
  const [videoDevicesCount, setVideoDevicesCount] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // Check available camera devices count
  const checkCameraDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevicesCount(videoInputs.length);
      }
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
    }
  }, []);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, [stream]);

  // Start camera with requested facing mode
  const startCamera = useCallback(
    async (targetFacingMode: 'user' | 'environment' = facingMode) => {
      setCameraError(null);
      setCameraErrorType(null);
      setIsStarting(true);

      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Your current browser does not support camera access via getUserMedia. Please use a modern browser or upload a photo directly.'
        );
        setCameraErrorType('unsupported');
        setIsStarting(false);
        return;
      }

      try {
        // High Priority requirement:
        // Prefer front-facing selfie camera by default with { video: { facingMode: { ideal: "user" } }, audio: false }
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        setIsCameraActive(true);
        setFacingMode(targetFacingMode);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch((playErr) => {
            console.warn('Video auto-play interrupted:', playErr);
          });
        }

        await checkCameraDevices();
      } catch (err: any) {
        console.error('Camera access error:', err);
        setIsCameraActive(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please allow camera access in your browser site settings, or use the image upload option below.'
          );
          setCameraErrorType('denied');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError(
            'No camera hardware detected on this device. Please connect a webcam or upload a photo.'
          );
          setCameraErrorType('not_found');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError(
            'The camera is currently in use by another application or tab. Please close other camera apps and retry.'
          );
          setCameraErrorType('in_use');
        } else {
          setCameraError(
            `Unable to start camera (${err.name || 'Error'}: ${err.message || 'unknown'}). You can still upload food photos.`
          );
          setCameraErrorType('unknown');
        }
      } finally {
        setIsStarting(false);
      }
    },
    [facingMode, stream, checkCameraDevices]
  );

  // Automatically start camera on mount with front-facing camera default
  useEffect(() => {
    let mounted = true;
    startCamera('user');

    return () => {
      mounted = false;
      // Stop all tracks when user navigates away or unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Make sure videoRef has the stream attached when it updates
  useEffect(() => {
    if (videoRef.current && stream && isCameraActive) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isCameraActive]);

  // Switch camera between "user" and "environment"
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  // Capture frame to canvas
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Create offscreen canvas with full video resolution
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the real live video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    // Pause the video feed while reviewing snapshot
    try {
      video.pause();
    } catch (e) {
      // ignore
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (videoRef.current && stream) {
      videoRef.current.play().catch(() => {});
    } else {
      startCamera(facingMode);
    }
  };

  // Submit captured image for AI recognition
  const handleSubmitImage = () => {
    if (capturedImage) {
      onCaptureComplete(capturedImage);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-[#E3ECE5] shadow-xl overflow-hidden transition-all">
      {/* Header Info Banner */}
      <div className="bg-[#2D5A3C] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Camera className="w-5 h-5 text-[#88D49E]" />
          </div>
          <div>
            <h3 className="font-semibold text-base tracking-tight">Food Vision Scanner</h3>
            <p className="text-xs text-[#E3ECE5]/90">
              {facingMode === 'user'
                ? 'Front Selfie Camera Active (Default)'
                : 'Rear Tabletop Camera Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {videoDevicesCount !== null && videoDevicesCount > 1 ? (
            <button
              onClick={handleSwitchCamera}
              disabled={!isCameraActive || isStarting}
              title="Switch between front selfie camera and rear environment camera"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Switch Camera</span>
            </button>
          ) : (
            <button
              onClick={handleSwitchCamera}
              disabled={!isCameraActive || isStarting}
              title="Toggle camera facing mode"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{facingMode === 'user' ? 'Try Rear' : 'Use Front'}</span>
            </button>
          )}

          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/80 hover:bg-red-600 transition-colors cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => startCamera(facingMode)}
              disabled={isStarting}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#88D49E] text-[#1E3A27] font-semibold hover:bg-[#72C889] transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start</span>
            </button>
          )}
        </div>
      </div>

      {/* Helpful instruction notice */}
      <div className="bg-[#F4F9F5] border-b border-[#E3ECE5] px-4 py-2.5 text-xs text-[#2D5A3C] flex items-center gap-2">
        <Info className="w-4 h-4 text-[#2D5A3C] shrink-0" />
        <span>
          <strong>Pro-Tip:</strong> Hold produce or leftovers directly in front of your front camera, or switch to the rear camera to scan dishes resting on your kitchen counter.
        </span>
      </div>

      {/* Camera Viewport or Error Screen */}
      <div className="relative bg-[#1A261E] aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
        {/* Error Fallback State */}
        {cameraError && !capturedImage && (
          <div className="p-6 text-center max-w-md mx-auto text-white">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-lg mb-1">Camera Unavailable</h4>
            <p className="text-sm text-gray-300 mb-5 leading-relaxed">{cameraError}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2.5 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white text-sm font-medium transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Camera
              </button>
              <button
                onClick={onSwitchToUpload}
                className="px-4 py-2.5 rounded-xl bg-white text-[#2D5A3C] hover:bg-gray-100 text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <Upload className="w-4 h-4" />
                Upload Photo Instead
              </button>
            </div>
          </div>
        )}

        {/* Live Video View */}
        {!capturedImage && !cameraError && (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-white/40 rounded-3xl relative">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#88D49E] rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#88D49E] rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#88D49E] rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#88D49E] rounded-br-xl" />

                <div className="absolute inset-x-0 bottom-4 text-center">
                  <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Frame your food or ingredient here
                  </span>
                </div>
              </div>
            </div>

            {/* Live Camera Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE • {facingMode === 'user' ? 'Front Camera' : 'Rear Camera'}</span>
            </div>
          </>
        )}

        {/* Captured Snapshot Preview */}
        {capturedImage && (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured Food Snapshot"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#2D5A3C] text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#88D49E]" />
              <span>Photo Captured — Ready for AI</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E3ECE5] flex flex-col gap-3">
        {!capturedImage ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSwitchToUpload}
              className="px-3.5 py-2.5 rounded-xl border border-[#CBD5CD] text-[#2D5A3C] hover:bg-white text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>

            {/* Big Capture Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isCameraActive || isStarting}
              className="flex-1 max-w-xs mx-auto py-3 px-6 rounded-2xl bg-[#2D5A3C] hover:bg-[#234830] active:scale-95 text-white font-semibold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#88D49E]" />
              <span>Capture Photo</span>
            </button>

            <button
              type="button"
              onClick={handleSwitchCamera}
              disabled={!isCameraActive}
              className="px-3.5 py-2.5 rounded-xl border border-[#CBD5CD] text-[#2D5A3C] hover:bg-white text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              title="Switch camera"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Flip</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRetake}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#CBD5CD] text-[#2D5A3C] hover:bg-white text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Photo</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitImage}
              disabled={isAnalyzing}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white text-sm sm:text-base font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#88D49E]" />
                  <span>Gemini Vision is Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#88D49E]" />
                  <span>Recognize Food with Gemini</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
