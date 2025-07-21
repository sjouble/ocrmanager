import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PackagingUnitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 기본 포장단위들
const DEFAULT_UNITS = ['카톤', '중포', '낱개'];

export default function PackagingUnitsModal({ open, onOpenChange }: PackagingUnitsModalProps) {
  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);
  const [newUnit, setNewUnit] = useState("");
  const { toast } = useToast();

  const handleAddUnit = () => {
    if (!newUnit.trim()) {
      toast({
        title: "입력 오류",
        description: "포장단위명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (units.includes(newUnit.trim())) {
      toast({
        title: "중복 오류",
        description: "이미 존재하는 포장단위입니다.",
        variant: "destructive",
      });
      return;
    }

    setUnits([...units, newUnit.trim()]);
    setNewUnit("");
    toast({
      title: "추가 완료",
      description: "새 포장단위가 추가되었습니다.",
    });
  };

  const handleRemoveUnit = (unitToRemove: string) => {
    if (DEFAULT_UNITS.includes(unitToRemove)) {
      toast({
        title: "삭제 불가",
        description: "기본 포장단위는 삭제할 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setUnits(units.filter(unit => unit !== unitToRemove));
    toast({
      title: "삭제 완료",
      description: "포장단위가 삭제되었습니다.",
    });
  };

  const handleReset = () => {
    setUnits(DEFAULT_UNITS);
    toast({
      title: "초기화 완료",
      description: "기본 포장단위로 초기화되었습니다.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">포장단위 설정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add new unit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-secondary">
              새 포장단위 추가
            </Label>
            <div className="flex gap-2">
              <Input
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="포장단위명 입력"
                className="flex-1 bg-dark-card border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddUnit()}
              />
              <Button
                onClick={handleAddUnit}
                className="bg-primary-blue hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Units list */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-secondary">
              포장단위 목록
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {units.map((unit) => (
                <div
                  key={unit}
                  className="flex items-center justify-between p-3 bg-dark-card rounded-lg border border-gray-600"
                >
                  <span className="text-white">{unit}</span>
                  {!DEFAULT_UNITS.includes(unit) && (
                    <Button
                      onClick={() => handleRemoveUnit(unit)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 bg-dark-card hover:bg-gray-600 text-white border-gray-600"
            >
              기본값으로 초기화
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-primary-blue hover:bg-blue-600 text-white"
            >
              확인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
