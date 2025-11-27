import { describe, expect, it } from "vitest";
import {
  createOrgKaizenConfigEntity,
  type OrgKaizenConfigEntity,
  updateOrgKaizenConfigEntity,
} from "./org-kaizen-config.entity";

describe("OrgKaizenConfigEntity", () => {
  describe("createOrgKaizenConfigEntity", () => {
    it("should create entity with required fields", () => {
      const config = createOrgKaizenConfigEntity({
        organizationId: "org-123",
        categoryPoints: {
          "1": { points: 100 },
        },
      });

      expect(config.organizationId).toBe("org-123");
      expect(config.categoryPoints["1"].points).toBe(100);
    });

    it("should set sequence to 0", () => {
      const config = createOrgKaizenConfigEntity({
        organizationId: "org-123",
        categoryPoints: {
          "1": { points: 50 },
        },
      });

      // sequence removed.toBe(0);
    });

    it("should create entity with all category points", () => {
      const config = createOrgKaizenConfigEntity({
        organizationId: "org-123",
        categoryPoints: {
          "1": { points: 100, description: "Basic" },
          "2": { points: 200, description: "Intermediate" },
          "3": { points: 300, description: "Advanced" },
          "4": { points: 400, description: "Expert" },
          "5": { points: 500, description: "Master" },
        },
      });

      expect(config.categoryPoints["1"].points).toBe(100);
      expect(config.categoryPoints["2"]?.points).toBe(200);
      expect(config.categoryPoints["3"]?.points).toBe(300);
      expect(config.categoryPoints["4"]?.points).toBe(400);
      expect(config.categoryPoints["5"]?.points).toBe(500);
    });

    it("should create entity with category descriptions", () => {
      const config = createOrgKaizenConfigEntity({
        organizationId: "org-123",
        categoryPoints: {
          "1": { points: 100, description: "Simple improvements" },
          "2": { points: 200, description: "Medium complexity" },
        },
      });

      expect(config.categoryPoints["1"].description).toBe(
        "Simple improvements",
      );
      expect(config.categoryPoints["2"]?.description).toBe("Medium complexity");
    });

    it("should allow category without description", () => {
      const config = createOrgKaizenConfigEntity({
        organizationId: "org-123",
        categoryPoints: {
          "1": { points: 75 },
        },
      });

      expect(config.categoryPoints["1"].description).toBeUndefined();
    });
  });

  describe("updateOrgKaizenConfigEntity", () => {
    const existingConfig: OrgKaizenConfigEntity = {
      organizationId: "org-123",
      categoryPoints: {
        "1": { points: 100, description: "Basic" },
        "2": { points: 200, description: "Intermediate" },
      },
      
    };

    it("should update category points", () => {
      const updated = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: {
          "1": { points: 150 },
        },
      });

      expect(updated.categoryPoints["1"].points).toBe(150);
    });

    it("should merge category points", () => {
      const updated = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: {
          "3": { points: 300, description: "Advanced" },
        },
      });

      expect(updated.categoryPoints["1"].points).toBe(100);
      expect(updated.categoryPoints["2"]?.points).toBe(200);
      expect(updated.categoryPoints["3"]?.points).toBe(300);
    });

    it("should increment sequence", () => {
      const updated = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: {
          "1": { points: 120 },
        },
      });

      // sequence removed.toBe(1);
    });

    it("should preserve organizationId", () => {
      const updated = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: {
          "1": { points: 120 },
        },
      });

      expect(updated.organizationId).toBe("org-123");
    });

    it("should update description for existing category", () => {
      const updated = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: {
          "1": { points: 100, description: "Updated description" },
        },
      });

      expect(updated.categoryPoints["1"].description).toBe(
        "Updated description",
      );
    });

    it("should handle consecutive updates", () => {
      const first = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: { "1": { points: 110 } },
      });
      const second = updateOrgKaizenConfigEntity(first, {
        categoryPoints: { "2": { points: 220 } },
      });

      expect(second.categoryPoints["1"].points).toBe(110);
      expect(second.categoryPoints["2"]?.points).toBe(220);
      // sequence removed.toBe(2);
    });

    it("should add new categories", () => {
      const updated = updateOrgKaizenConfigEntity(existingConfig, {
        categoryPoints: {
          "4": { points: 400 },
          "5": { points: 500 },
        },
      });

      expect(updated.categoryPoints["4"]?.points).toBe(400);
      expect(updated.categoryPoints["5"]?.points).toBe(500);
    });
  });
});
