import { describe, it, expect } from "vitest";
import {
  createSectorEntity,
  updateSectorEntity,
  type SectorEntity,
} from "./sector.entity";

describe("SectorEntity", () => {
  describe("createSectorEntity", () => {
    const validInput = {
      id: "sector-123",
      organizationId: "org-123",
      name: "Engineering",
    };

    it("should create entity with required fields", () => {
      const sector = createSectorEntity(validInput);

      expect(sector.id).toBe("sector-123");
      expect(sector.organizationId).toBe("org-123");
      expect(sector.name).toBe("Engineering");
    });

    it("should create entity with different names", () => {
      const sectors = ["Production", "Quality", "Safety", "Maintenance"];

      for (const name of sectors) {
        const sector = createSectorEntity({ ...validInput, name });
        expect(sector.name).toBe(name);
      }
    });
  });

  describe("updateSectorEntity", () => {
    const existingSector: SectorEntity = {
      id: "sector-123",
      organizationId: "org-123",
      name: "Original Sector",
    };

    it("should update name", () => {
      const updated = updateSectorEntity(existingSector, {
        name: "Updated Sector",
      });

      expect(updated.name).toBe("Updated Sector");
    });

    it("should preserve id", () => {
      const updated = updateSectorEntity(existingSector, {
        name: "Updated",
      });

      expect(updated.id).toBe("sector-123");
    });

    it("should preserve organizationId", () => {
      const updated = updateSectorEntity(existingSector, {
        name: "Updated",
      });

      expect(updated.organizationId).toBe("org-123");
    });

    it("should handle empty update object", () => {
      const updated = updateSectorEntity(existingSector, {});

      expect(updated.name).toBe("Original Sector");
    });

    it("should preserve name when update is undefined", () => {
      const updated = updateSectorEntity(existingSector, {
        name: undefined,
      });

      expect(updated.name).toBe("Original Sector");
    });
  });
});
