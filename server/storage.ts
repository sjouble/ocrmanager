import { inventoryItems, packagingUnits, type InventoryItem, type InsertInventoryItem, type PackagingUnit, type InsertPackagingUnit } from "@shared/schema";

export interface IStorage {
  // Inventory items
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  
  // Packaging units
  getPackagingUnits(): Promise<PackagingUnit[]>;
  createPackagingUnit(unit: InsertPackagingUnit): Promise<PackagingUnit>;
  deletePackagingUnit(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private inventoryItems: Map<number, InventoryItem>;
  private packagingUnits: Map<number, PackagingUnit>;
  private inventoryCurrentId: number;
  private packagingCurrentId: number;

  constructor() {
    this.inventoryItems = new Map();
    this.packagingUnits = new Map();
    this.inventoryCurrentId = 1;
    this.packagingCurrentId = 1;
    
    // Initialize with default packaging units
    this.initializeDefaultPackagingUnits();
  }

  private initializeDefaultPackagingUnits() {
    const defaultUnits = ["카톤", "중포", "낱개"];
    defaultUnits.forEach(name => {
      const unit: PackagingUnit = {
        id: this.packagingCurrentId++,
        name,
        createdAt: new Date(),
      };
      this.packagingUnits.set(unit.id, unit);
    });
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryCurrentId++;
    const item: InventoryItem = {
      id,
      productNumber: insertItem.productNumber,
      packagingUnit: insertItem.packagingUnit,
      quantity: insertItem.quantity,
      expirationDate: insertItem.expirationDate || null,
      createdAt: new Date(),
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    this.inventoryItems.delete(id);
  }

  async getPackagingUnits(): Promise<PackagingUnit[]> {
    return Array.from(this.packagingUnits.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'ko')
    );
  }

  async createPackagingUnit(insertUnit: InsertPackagingUnit): Promise<PackagingUnit> {
    const id = this.packagingCurrentId++;
    const unit: PackagingUnit = {
      ...insertUnit,
      id,
      createdAt: new Date(),
    };
    this.packagingUnits.set(id, unit);
    return unit;
  }

  async deletePackagingUnit(id: number): Promise<void> {
    this.packagingUnits.delete(id);
  }
}

export const storage = new MemStorage();
