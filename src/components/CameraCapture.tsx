import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  onCancel: () => void;
  isAnalyzing?: boolean;
}

export const CameraCapture = ({ onImageCapture, onCancel, isAnalyzing = false }: CameraCaptureProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      toast.error('Camera access denied. Please allow camera permissions or upload an image instead.');
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `meal_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
        onImageCapture(file);
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera, onImageCapture]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCapturedImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      onImageCapture(file);
    } else {
      toast.error('Please select a valid image file.');
    }
  }, [onImageCapture]);

  // Toggle camera facing mode
  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [isStreaming, stopCamera, startCamera]);

  // Reset to initial state
  const reset = useCallback(() => {
    setCapturedImage(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopCamera]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Capture Your Meal</h3>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Camera View or Captured Image */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {capturedImage ? (
              // Show captured image
              <img
                src={capturedImage}
                alt="Captured meal"
                className="w-full h-full object-cover"
              />
            ) : isStreaming ? (
              // Show live camera feed
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Camera Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={toggleCamera}
                      className="bg-white/90 hover:bg-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={capturePhoto}
                      disabled={isAnalyzing}
                      className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Show placeholder with start camera button
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera not active</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {capturedImage ? (
              // Options after capture
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={reset}>
                  Retake
                </Button>
                <Button disabled={isAnalyzing}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Meal'}
                </Button>
              </div>
            ) : (
              // Options before capture
              <div className="space-y-2">
                {!isStreaming ? (
                  <Button onClick={startCamera} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="outline" className="w-full">
                    Stop Camera
                  </Button>
                )}
                
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Position your meal clearly in the frame</p>
            <p>• Ensure good lighting for better analysis</p>
            <p>• Include the entire plate/meal in the shot</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCapture;