import { useState, useEffect } from 'react';

export interface InventoryItem {
  id: string;
  productNumber: string;
  packagingUnit: string;
  quantity: number;
  expirationDate: string | null;
  createdAt: Date;
}

export interface PackagingUnit {
  id: string;
  name: string;
}

const INVENTORY_STORAGE_KEY = 'inventory_items';
const PACKAGING_UNITS_STORAGE_KEY = 'packaging_units';

const DEFAULT_PACKAGING_UNITS: PackagingUnit[] = [
  { id: '1', name: '카톤' },
  { id: '2', name: '중포' },
  { id: '3', name: '낱개' },
];

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [packagingUnits, setPackagingUnits] = useState<PackagingUnit[]>(DEFAULT_PACKAGING_UNITS);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setItems(parsedItems.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      } catch (error) {
        console.error('Error loading inventory items:', error);
      }
    }

    const savedUnits = localStorage.getItem(PACKAGING_UNITS_STORAGE_KEY);
    if (savedUnits) {
      try {
        setPackagingUnits(JSON.parse(savedUnits));
      } catch (error) {
        console.error('Error loading packaging units:', error);
      }
    } else {
      // Save default units if not exists
      localStorage.setItem(PACKAGING_UNITS_STORAGE_KEY, JSON.stringify(DEFAULT_PACKAGING_UNITS));
    }
  }, []);

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Save packaging units to localStorage whenever units change
  useEffect(() => {
    localStorage.setItem(PACKAGING_UNITS_STORAGE_KEY, JSON.stringify(packagingUnits));
  }, [packagingUnits]);

  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const clearAllItems = () => {
    setItems([]);
  };

  const addPackagingUnit = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    
    // Check if unit already exists
    if (packagingUnits.some(unit => unit.name === trimmedName)) {
      throw new Error('이미 존재하는 포장단위입니다.');
    }

    const newUnit: PackagingUnit = {
      id: Date.now().toString(),
      name: trimmedName,
    };
    
    setPackagingUnits(prev => [...prev, newUnit].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
    return newUnit;
  };

  const removePackagingUnit = (id: string) => {
    setPackagingUnits(prev => prev.filter(unit => unit.id !== id));
  };

  const exportToText = () => {
    let exportText = '품번 | 수량 | 단위 | 유통기한\n';
    items.forEach(item => {
      const expirationDate = item.expirationDate || '-';
      exportText += `${item.productNumber} | ${item.quantity} | ${item.packagingUnit} | ${expirationDate}\n`;
    });
    return exportText;
  };

  return {
    items,
    packagingUnits,
    addItem,
    removeItem,
    updateItem,
    clearAllItems,
    addPackagingUnit,
    removePackagingUnit,
    exportToText,
  };
}
