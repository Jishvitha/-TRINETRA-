// Camera capture component for sighting reports
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (photoUrl: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  // Start camera on mount
  useState(() => {
    startCamera();
  });

  return (
    <div className="space-y-4">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-2 justify-center">
        {!capturedImage ? (
          <>
            <Button onClick={capturePhoto} size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Capture Photo
            </Button>
            <Button onClick={handleCancel} variant="outline" size="lg">
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={confirmCapture} size="lg">
              <Check className="w-5 h-5 mr-2" />
              Use Photo
            </Button>
            <Button onClick={retake} variant="outline" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Retake
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        📸 Photo evidence is mandatory to reduce false reports and increase credibility
      </p>
    </div>
  );
}
