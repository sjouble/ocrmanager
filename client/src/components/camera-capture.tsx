import { useRef, useEffect, useState } from "react";
import { X, Camera as CameraIcon, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onImageCapture: (imageData: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onImageCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startCamera, stopCamera, isActive, error } = useCamera(videoRef);
  const { toast } = useToast();
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      try {
        await startCamera();
      } catch (err) {
        toast({
          title: "카메라 오류",
          description: "카메라에 접근할 수 없습니다. 권한을 확인해주세요.",
          variant: "destructive",
        });
      }
    };

    initCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera, toast]);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    onImageCapture(imageData);
  };

  const handleGalleryAccess = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            onImageCapture(result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">카메라 오류: {error.message}</p>
          <Button onClick={onCancel} variant="outline" className="text-white border-gray-600">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera overlay guide */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 px-4 py-2 rounded-lg">
          <p className="text-white text-sm text-center">제품의 품번이 보이도록 촬영하세요</p>
        </div>
      </div>
      
      {/* Flash toggle */}
      <Button
        onClick={() => setFlashEnabled(!flashEnabled)}
        variant="ghost"
        size="sm"
        className="absolute top-8 right-8 bg-dark-surface rounded-full p-3 text-white hover:bg-gray-600"
      >
        <div className={flashEnabled ? "text-yellow-400" : "text-white"}>⚡</div>
      </Button>
      
      {/* Camera controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="bg-dark-surface rounded-full p-3 text-white hover:bg-gray-600"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <Button
          onClick={captureImage}
          disabled={!isActive}
          className="w-18 h-18 bg-white border-4 border-primary-blue rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <div className="w-8 h-8 bg-primary-blue rounded-full"></div>
        </Button>
        
        <Button
          onClick={handleGalleryAccess}
          variant="ghost"
          size="sm"
          className="bg-dark-surface rounded-full p-3 text-white hover:bg-gray-600"
        >
          <Image className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
