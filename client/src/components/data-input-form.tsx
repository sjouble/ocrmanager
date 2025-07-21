import { useState, useEffect } from "react";
import { Camera, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface DataInputFormProps {
  initialProductNumber: string;
  onSave: () => void;
  onAddMore: () => void;
  onViewList: () => void;
  onEditPackaging: () => void;
}

// 기본 포장단위들
const DEFAULT_PACKAGING_UNITS = ['카톤', '중포', '낱개'];

export default function DataInputForm({ 
  initialProductNumber, 
  onSave, 
  onAddMore, 
  onViewList, 
  onEditPackaging 
}: DataInputFormProps) {
  const [productNumber, setProductNumber] = useState(initialProductNumber);
  const [packagingUnit, setPackagingUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  
  const { toast } = useToast();
  const { addItem } = useLocalStorage();

  useEffect(() => {
    setProductNumber(initialProductNumber);
  }, [initialProductNumber]);

  const clearForm = () => {
    setProductNumber('');
    setPackagingUnit('');
    setQuantity('');
    setExpirationDate('');
  };

  const handleSave = () => {
    if (!productNumber || !packagingUnit || !quantity) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (quantity && parseInt(quantity) <= 0) {
      toast({
        title: "수량 오류",
        description: "수량은 1 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (expirationDate && !/^\d{8}$/.test(expirationDate)) {
      toast({
        title: "날짜 형식 오류",
        description: "유통기한은 YYYYMMDD 형식으로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 로컬 스토리지에 저장
    addItem(productNumber);
    
    toast({
      title: "저장 완료",
      description: "품번이 목록에 추가되었습니다.",
    });
    
    clearForm();
    onSave();
  };

  const handleExpirationDateChange = (value: string) => {
    // Only allow numbers and limit to 8 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setExpirationDate(cleaned);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Product Number */}
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-text-secondary">품번</Label>
        <Input
          value={productNumber}
          onChange={(e) => setProductNumber(e.target.value)}
          className="w-full bg-dark-card border-gray-600 text-white text-lg font-mono focus:border-primary-blue"
          placeholder="품번을 입력하세요"
        />
      </div>
      
      {/* Packaging Unit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-medium text-text-secondary">포장단위</Label>
          <Button
            onClick={onEditPackaging}
            variant="ghost"
            size="sm"
            className="text-primary-blue hover:text-blue-400 p-1"
          >
            편집
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEFAULT_PACKAGING_UNITS.map((unit) => (
            <Button
              key={unit}
              type="button"
              variant={packagingUnit === unit ? "default" : "outline"}
              onClick={() => setPackagingUnit(unit)}
              className={`w-full ${
                packagingUnit === unit 
                  ? 'bg-primary-blue text-white' 
                  : 'bg-dark-card border-gray-600 text-white hover:bg-gray-600'
              }`}
            >
              {unit}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Quantity */}
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-text-secondary">수량</Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full bg-dark-card border-gray-600 text-white text-lg focus:border-primary-blue"
          placeholder="수량을 입력하세요"
          min="1"
        />
      </div>
      
      {/* Expiration Date */}
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-text-secondary">유통기한 (선택사항)</Label>
        <Input
          value={expirationDate}
          onChange={(e) => handleExpirationDateChange(e.target.value)}
          className="w-full bg-dark-card border-gray-600 text-white text-lg font-mono focus:border-primary-blue"
          placeholder="YYYYMMDD"
          maxLength={8}
        />
        <p className="text-text-secondary text-xs">예: 20251201</p>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button 
          onClick={handleSave}
          className="w-full bg-primary-blue text-white py-4 text-lg font-medium hover:bg-blue-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          목록에 추가
        </Button>
        
        <div className="flex gap-3">
          <Button 
            onClick={onAddMore}
            variant="outline"
            className="flex-1 bg-dark-card hover:bg-gray-600 text-white border-gray-600 py-4 text-lg font-medium"
          >
            <Camera className="w-5 h-5 mr-2" />
            더 추가
          </Button>
          
          <Button 
            onClick={onViewList}
            variant="outline"
            className="flex-1 bg-dark-card hover:bg-gray-600 text-white border-gray-600 py-4 text-lg font-medium"
          >
            <List className="w-5 h-5 mr-2" />
            목록 보기
          </Button>
        </div>
      </div>
    </div>
  );
}
