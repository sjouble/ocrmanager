import { useState } from "react";
import { Trash2, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InventoryItem } from "@shared/schema";

interface InventoryListProps {
  onAddNew: () => void;
}

export default function InventoryList({ onAddNew }: InventoryListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "삭제 완료",
        description: "항목이 삭제되었습니다.",
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

  const handleDeleteItem = (id: number) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const exportToText = () => {
    if (!items || items.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "내보낼 항목이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    let exportText = '품번 | 수량 | 단위 | 유통기한\n';
    items.forEach((item: InventoryItem) => {
      const expirationDate = item.expirationDate || '-';
      exportText += `${item.productNumber} | ${item.quantity} | ${item.packagingUnit} | ${expirationDate}\n`;
    });

    // Try to copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
      toast({
        title: "클립보드 복사 완료",
        description: "재고 목록이 클립보드에 복사되었습니다.",
      });
    }).catch(() => {
      // Fallback: create downloadable text file
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "파일 다운로드",
        description: "재고 목록이 텍스트 파일로 저장되었습니다.",
      });
    });
  };

  const shareData = async () => {
    if (!items || items.length === 0) {
      toast({
        title: "공유 실패",
        description: "공유할 항목이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    let shareText = '재고 정리 목록\n\n';
    shareText += '품번 | 수량 | 단위 | 유통기한\n';
    items.forEach((item: InventoryItem) => {
      const expirationDate = item.expirationDate || '-';
      shareText += `${item.productNumber} | ${item.quantity} | ${item.packagingUnit} | ${expirationDate}\n`;
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: '재고 정리 목록',
          text: shareText,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "클립보드 복사 완료",
          description: "재고 목록이 클립보드에 복사되었습니다.",
        });
      });
    }
  };

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    // Convert YYYYMMDD to YYYY-MM-DD
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">목록을 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 pb-32">
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item: InventoryItem) => (
              <div key={item.id} className="bg-dark-card rounded-lg p-4 border-l-4 border-primary-blue">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary-blue font-mono text-lg font-bold">
                    {item.productNumber}
                  </span>
                  <Button
                    onClick={() => handleDeleteItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-text-secondary hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">수량:</span>
                    <span className="text-white">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">단위:</span>
                    <span className="text-white">{item.packagingUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">유통기한:</span>
                    <span className="text-white">{formatExpirationDate(item.expirationDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">목록이 비어있습니다</h3>
            <p className="text-text-secondary mb-6">첫 번째 재고 항목을 추가해보세요</p>
            <Button 
              onClick={onAddNew}
              className="bg-primary-blue text-white hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              항목 추가
            </Button>
          </div>
        )}
      </div>

      {/* Fixed bottom action buttons */}
      {items && items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark-surface border-t border-gray-600">
          <div className="flex gap-3 mb-3">
            <Button 
              onClick={exportToText}
              className="flex-1 bg-green-700 text-white py-3 font-medium hover:bg-green-600"
            >
              <Download className="w-4 h-4 mr-2" />
              텍스트 저장
            </Button>
            <Button 
              onClick={shareData}
              className="flex-1 bg-blue-700 text-white py-3 font-medium hover:bg-blue-600"
            >
              <Share className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
          <Button 
            onClick={onAddNew}
            className="w-full bg-primary-blue text-white py-3 font-medium hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 항목 추가
          </Button>
        </div>
      )}
      
      {/* Item count badge */}
      {items && items.length > 0 && (
        <div className="fixed top-4 right-4 bg-primary-blue text-white px-3 py-1 rounded-full text-sm font-medium">
          {items.length}
        </div>
      )}
    </>
  );
}
