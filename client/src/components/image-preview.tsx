import { useRef, useState, useEffect } from "react";
import { RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { performOCR } from "@/lib/ocr";

interface ImagePreviewProps {
  imageData: string | null;
  onOCRResult: (result: string) => void;
  onRetake: () => void;
  onCancel: () => void;
}

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImagePreview({ imageData, onOCRResult, onRetake, onCancel }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (imageData && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawSelection(ctx);
        }
      };
    }
  }, [selectionArea, imageData]);

  const drawSelection = (ctx: CanvasRenderingContext2D) => {
    if (!selectionArea) return;
    
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(selectionArea.x, selectionArea.y, selectionArea.width, selectionArea.height);
    
    ctx.fillStyle = 'rgba(25, 118, 210, 0.2)';
    ctx.fillRect(selectionArea.x, selectionArea.y, selectionArea.width, selectionArea.height);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionArea(null);
    setOcrResult(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    
    const selection: SelectionArea = {
      x: Math.min(selectionStart.x, currentX),
      y: Math.min(selectionStart.y, currentY),
      width: Math.abs(currentX - selectionStart.x),
      height: Math.abs(currentY - selectionStart.y)
    };
    
    setSelectionArea(selection);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    
    if (selectionArea && selectionArea.width > 10 && selectionArea.height > 10) {
      processOCR();
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionArea(null);
    setOcrResult(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = (touch.clientX - rect.left) * scaleX;
    const currentY = (touch.clientY - rect.top) * scaleY;
    
    const selection: SelectionArea = {
      x: Math.min(selectionStart.x, currentX),
      y: Math.min(selectionStart.y, currentY),
      width: Math.abs(currentX - selectionStart.x),
      height: Math.abs(currentY - selectionStart.y)
    };
    
    setSelectionArea(selection);
  };

  const handleTouchEnd = () => {
    setIsSelecting(false);
    
    if (selectionArea && selectionArea.width > 10 && selectionArea.height > 10) {
      processOCR();
    }
  };

  const processOCR = async () => {
    if (!imageData || !selectionArea || !canvasRef.current) return;

    setIsProcessing(true);
    
    try {
      // Create a temporary canvas for the selected area
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        tempCanvas.width = selectionArea.width;
        tempCanvas.height = selectionArea.height;
        
        if (tempCtx) {
          tempCtx.drawImage(
            img,
            selectionArea.x, selectionArea.y, selectionArea.width, selectionArea.height,
            0, 0, selectionArea.width, selectionArea.height
          );
          
          const croppedImageData = tempCanvas.toDataURL('image/jpeg', 0.9);
          
          try {
            const result = await performOCR(croppedImageData);
            setOcrResult(result);
            
            if (result) {
              toast({
                title: "품번 인식 완료",
                description: `인식된 품번: ${result}`,
              });
            } else {
              toast({
                title: "품번 인식 실패",
                description: "다시 선택해 주세요.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('OCR processing error:', error);
            toast({
              title: "인식 오류",
              description: "품번을 인식할 수 없습니다.",
              variant: "destructive",
            });
          }
        }
        
        setIsProcessing(false);
      };
      
      img.src = imageData;
    } catch (error) {
      console.error('OCR error:', error);
      setIsProcessing(false);
      toast({
        title: "오류",
        description: "품번 인식 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmSelection = () => {
    if (ocrResult) {
      onOCRResult(ocrResult);
    }
  };

  if (!imageData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-white">이미지를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="relative">
        <img 
          ref={imageRef}
          src={imageData} 
          alt="Captured product"
          className="w-full h-auto"
        />
        
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Selection instructions */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-4 py-2 rounded-lg">
          <p className="text-white text-sm text-center">품번이 있는 영역을 터치하여 선택하세요</p>
        </div>
        
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">품번을 인식하고 있습니다...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-dark-surface">
        <div className="flex gap-3 mb-4">
          <Button 
            onClick={onRetake}
            variant="outline"
            className="flex-1 bg-dark-card text-white border-gray-600 hover:bg-gray-600 py-3 font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 촬영
          </Button>
          <Button 
            onClick={handleConfirmSelection}
            disabled={!ocrResult}
            className="flex-1 bg-primary-blue text-white py-3 font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            <Check className="w-4 h-4 mr-2" />
            선택 완료
          </Button>
        </div>
        
        {/* OCR Result Display */}
        {ocrResult && (
          <div className="bg-green-900 bg-opacity-50 p-3 rounded-lg">
            <p className="text-green-300 text-sm mb-1">인식된 품번:</p>
            <p className="text-white text-lg font-mono">{ocrResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
