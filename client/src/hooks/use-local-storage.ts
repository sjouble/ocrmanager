import { useState, useEffect } from 'react';

export interface RecognizedItem {
  id: string;
  productNumber: string;
  timestamp: number;
  imageData?: string;
}

const STORAGE_KEY = 'ocr-recognized-items';

export function useLocalStorage() {
  const [items, setItems] = useState<RecognizedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load items from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 아이템 추가
  const addItem = (productNumber: string, imageData?: string) => {
    const newItem: RecognizedItem = {
      id: Date.now().toString(),
      productNumber,
      timestamp: Date.now(),
      imageData,
    };

    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to save item to localStorage:', error);
    }

    return newItem;
  };

  // 아이템 삭제
  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  };

  // 모든 아이템 삭제
  const clearAllItems = () => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear items from localStorage:', error);
    }
  };

  // 아이템 검색
  const searchItems = (query: string) => {
    if (!query.trim()) return items;
    return items.filter(item => 
      item.productNumber.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    items,
    isLoading,
    addItem,
    removeItem,
    clearAllItems,
    searchItems,
  };
} 