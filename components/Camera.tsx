
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraProps {
  onCapture: (base64: string) => void;
  label?: string;
  isProcessing?: boolean;
}

const Camera: React.FC<CameraProps> = ({ onCapture, label = "Capture Frame", isProcessing = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Unable to access camera. Please ensure permissions are granted.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-xl overflow-hidden shadow-lg group">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/50 p-4 text-center">
          {error}
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover transform -scale-x-100 ${isProcessing ? 'opacity-50 blur-sm' : ''}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-white text-xs font-medium uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Live Feed</span>
          </div>

          <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-xl">
            <div className="absolute inset-10 border-2 border-dashed border-blue-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {!isProcessing && (
            <button
              onClick={capture}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow-xl hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <span>{label}</span>
            </button>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold text-lg drop-shadow-lg">Scanning Face...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Camera;
