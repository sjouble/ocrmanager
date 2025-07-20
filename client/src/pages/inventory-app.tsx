import { useState } from "react";
import { Camera, List, Settings, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CameraCapture from "@/components/camera-capture";
import ImagePreview from "@/components/image-preview";
import DataInputForm from "@/components/data-input-form";
import InventoryList from "@/components/inventory-list";
import PackagingUnitsModal from "@/components/packaging-units-modal";

type Screen = 'start' | 'camera' | 'imagePreview' | 'dataInput' | 'inventoryList';

export default function InventoryApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [selectedProductNumber, setSelectedProductNumber] = useState<string>('');
  const [showPackagingModal, setShowPackagingModal] = useState(false);

  const handleImageCapture = (imageData: string) => {
    setCapturedImageData(imageData);
    setCurrentScreen('imagePreview');
  };

  const handleOCRResult = (result: string) => {
    setSelectedProductNumber(result);
    setCurrentScreen('dataInput');
  };

  const handleItemSaved = () => {
    setSelectedProductNumber('');
    setCapturedImageData(null);
    setCurrentScreen('start');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'start':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-bg">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">품번 인식 재고 정리</h1>
              <p className="text-text-secondary text-lg">
                카메라로 제품을 촬영하여<br />재고를 빠르게 정리하세요
              </p>
            </div>
            
            <div className="w-full max-w-sm space-y-4">
              <Button 
                onClick={() => setCurrentScreen('camera')}
                className="w-full bg-primary-blue hover:bg-blue-600 text-white py-4 text-lg font-medium touch-target"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                과출정리 시작
              </Button>
              
              <Button 
                onClick={() => setCurrentScreen('inventoryList')}
                variant="outline"
                className="w-full bg-dark-card hover:bg-gray-600 text-white border-gray-600 py-4 text-lg font-medium touch-target"
                size="lg"
              >
                <List className="w-5 h-5 mr-2" />
                저장된 목록 보기
              </Button>
              
              <Button 
                onClick={() => setShowPackagingModal(true)}
                variant="outline"
                className="w-full bg-dark-card hover:bg-gray-600 text-white border-gray-600 py-4 text-lg font-medium touch-target"
                size="lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                포장단위 설정
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-text-secondary text-sm">
                📷 카메라 권한이 필요합니다
              </p>
            </div>
          </div>
        );

      case 'camera':
        return (
          <CameraCapture
            onImageCapture={handleImageCapture}
            onCancel={() => setCurrentScreen('start')}
          />
        );

      case 'imagePreview':
        return (
          <ImagePreview
            imageData={capturedImageData}
            onOCRResult={handleOCRResult}
            onRetake={() => setCurrentScreen('camera')}
            onCancel={() => setCurrentScreen('start')}
          />
        );

      case 'dataInput':
        return (
          <div className="min-h-screen bg-dark-bg">
            <div className="sticky top-0 bg-dark-surface p-4 border-b border-gray-600 z-10">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setCurrentScreen('imagePreview')}
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-white p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-white">제품 정보 입력</h2>
              </div>
            </div>
            <DataInputForm
              initialProductNumber={selectedProductNumber}
              onSave={handleItemSaved}
              onAddMore={() => setCurrentScreen('camera')}
              onViewList={() => setCurrentScreen('inventoryList')}
              onEditPackaging={() => setShowPackagingModal(true)}
            />
          </div>
        );

      case 'inventoryList':
        return (
          <div className="min-h-screen bg-dark-bg">
            <div className="sticky top-0 bg-dark-surface p-4 border-b border-gray-600 z-10">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setCurrentScreen('start')}
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary hover:text-white p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold text-white flex-1">재고 목록</h2>
              </div>
            </div>
            <InventoryList
              onAddNew={() => setCurrentScreen('camera')}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderScreen()}
      <PackagingUnitsModal
        open={showPackagingModal}
        onOpenChange={setShowPackagingModal}
      />
    </>
  );
}
