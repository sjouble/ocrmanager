import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInventoryItemSchema, insertPackagingUnitSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Inventory Items Routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory items" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create inventory item" });
      }
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }
      await storage.deleteInventoryItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Packaging Units Routes
  app.get("/api/packaging-units", async (req, res) => {
    try {
      const units = await storage.getPackagingUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to get packaging units" });
    }
  });

  app.post("/api/packaging-units", async (req, res) => {
    try {
      const validatedData = insertPackagingUnitSchema.parse(req.body);
      const unit = await storage.createPackagingUnit(validatedData);
      res.status(201).json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create packaging unit" });
      }
    }
  });

  app.delete("/api/packaging-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }
      await storage.deletePackagingUnit(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete packaging unit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
