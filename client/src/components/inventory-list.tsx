import { useState } from "react";
import { Plus, Search, Trash2, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { format } from "date-fns";

interface InventoryListProps {
  onAddNew: () => void;
}

export default function InventoryList({ onAddNew }: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { items, isLoading, removeItem, clearAllItems, searchItems } = useLocalStorage();

  const filteredItems = searchItems(searchQuery);

  const handleDelete = (id: string) => {
    removeItem(id);
    toast({
      title: "삭제 완료",
      description: "항목이 삭제되었습니다.",
    });
  };

  const handleClearAll = () => {
    if (window.confirm("모든 항목을 삭제하시겠습니까?")) {
      clearAllItems();
      toast({
        title: "전체 삭제 완료",
        description: "모든 항목이 삭제되었습니다.",
      });
    }
  };

  const handleExport = () => {
    if (items.length === 0) {
      toast({
        title: "내보낼 항목 없음",
        description: "저장된 항목이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      "품번,인식시간",
      ...items.map(item => 
        `${item.productNumber},${format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `품번목록_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "내보내기 완료",
      description: "CSV 파일이 다운로드되었습니다.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="품번으로 검색..."
          className="pl-10 bg-dark-card border-gray-600 text-white"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onAddNew}
          className="flex-1 bg-primary-blue hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          새로 추가
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          className="bg-dark-card hover:bg-gray-600 text-white border-gray-600"
        >
          <Download className="w-4 h-4 mr-2" />
          내보내기
        </Button>
        <Button
          onClick={handleClearAll}
          variant="outline"
          className="bg-red-900 hover:bg-red-800 text-white border-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          전체삭제
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="bg-dark-card border-gray-600">
            <CardContent className="p-6 text-center">
              <div className="text-text-secondary">
                {searchQuery ? "검색 결과가 없습니다." : "저장된 품번이 없습니다."}
              </div>
              {!searchQuery && (
                <Button
                  onClick={onAddNew}
                  className="mt-4 bg-primary-blue hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  첫 번째 품번 추가
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="bg-dark-card border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-mono text-white">
                      {item.productNumber}
                    </div>
                    <div className="flex items-center text-text-secondary text-sm mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="text-center text-text-secondary text-sm">
          총 {items.length}개 항목
          {searchQuery && filteredItems.length !== items.length && (
            <span> (검색결과: {filteredItems.length}개)</span>
          )}
        </div>
      )}
    </div>
  );
}
