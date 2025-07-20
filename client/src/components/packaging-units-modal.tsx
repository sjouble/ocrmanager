import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PackagingUnit, InsertPackagingUnit } from "@shared/schema";

interface PackagingUnitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PackagingUnitsModal({ open, onOpenChange }: PackagingUnitsModalProps) {
  const [newUnitName, setNewUnitName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: packagingUnits = [], isLoading } = useQuery<PackagingUnit[]>({
    queryKey: ['/api/packaging-units'],
    enabled: open,
  });

  const addUnitMutation = useMutation({
    mutationFn: async (data: InsertPackagingUnit) => {
      return apiRequest('POST', '/api/packaging-units', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packaging-units'] });
      setNewUnitName('');
      toast({
        title: "추가 완료",
        description: "새 포장단위가 추가되었습니다.",
      });
    },
    onError: (error: any) => {
      const message = error?.message?.includes('unique') 
        ? '이미 존재하는 포장단위입니다.' 
        : '포장단위 추가에 실패했습니다.';
      
      toast({
        title: "추가 실패",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/packaging-units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packaging-units'] });
      toast({
        title: "삭제 완료",
        description: "포장단위가 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleAddUnit = () => {
    const trimmedName = newUnitName.trim();
    
    if (!trimmedName) {
      toast({
        title: "입력 오류",
        description: "포장단위명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 20) {
      toast({
        title: "입력 오류",
        description: "포장단위명은 20자 이내로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    addUnitMutation.mutate({ name: trimmedName });
  };

  const handleDeleteUnit = (id: number, name: string) => {
    if (confirm(`'${name}' 포장단위를 삭제하시겠습니까?`)) {
      deleteUnitMutation.mutate(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUnit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border-gray-600 text-white max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">포장단위 관리</DialogTitle>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new unit */}
          <div>
            <div className="flex gap-2">
              <Input
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-dark-card border-gray-600 text-white focus:border-primary-blue"
                placeholder="새 포장단위 입력"
                maxLength={20}
              />
              <Button
                onClick={handleAddUnit}
                disabled={addUnitMutation.isPending}
                className="bg-primary-blue text-white px-4 hover:bg-blue-600 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Existing units */}
          <div>
            <h4 className="text-text-secondary font-medium mb-3">기존 포장단위</h4>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {packagingUnits && packagingUnits.length > 0 ? (
                  packagingUnits.map((unit: PackagingUnit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between bg-dark-card p-3 rounded-lg"
                    >
                      <span className="text-white">{unit.name}</span>
                      <Button
                        onClick={() => handleDeleteUnit(unit.id, unit.name)}
                        disabled={deleteUnitMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-text-secondary">포장단위가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
