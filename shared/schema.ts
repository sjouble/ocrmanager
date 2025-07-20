import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  productNumber: text("product_number").notNull(),
  packagingUnit: text("packaging_unit").notNull(),
  quantity: integer("quantity").notNull(),
  expirationDate: text("expiration_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const packagingUnits = pgTable("packaging_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
});

export const insertPackagingUnitSchema = createInsertSchema(packagingUnits).omit({
  id: true,
  createdAt: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertPackagingUnit = z.infer<typeof insertPackagingUnitSchema>;
export type PackagingUnit = typeof packagingUnits.$inferSelect;
