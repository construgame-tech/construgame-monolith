import { describe, expect, it } from "vitest";
import {
  createKaizenTypeEntity,
  type KaizenTypeEntity,
  updateKaizenTypeEntity,
} from "./kaizen-type.entity";

describe("KaizenTypeEntity", () => {
  describe("createKaizenTypeEntity", () => {
    const validInput = {
      id: "type-123",
      organizationId: "org-123",
      name: "Safety Improvement",
      points: 100,
    };

    it("should create entity with required fields", () => {
      const type = createKaizenTypeEntity(validInput);

      expect(type.id).toBe("type-123");
      expect(type.organizationId).toBe("org-123");
      expect(type.name).toBe("Safety Improvement");
      expect(type.points).toBe(100);
    });

    it("should set sequence to 0 by default", () => {
      const type = createKaizenTypeEntity(validInput);

      expect(type.sequence).toBe(0);
    });

    it("should create entity with optional description", () => {
      const input = {
        ...validInput,
        description: "Improvements related to workplace safety",
      };

      const type = createKaizenTypeEntity(input);

      expect(type.description).toBe("Improvements related to workplace safety");
    });

    it("should create entity with ideaPoints", () => {
      const input = {
        ...validInput,
        ideaPoints: 50,
      };

      const type = createKaizenTypeEntity(input);

      expect(type.ideaPoints).toBe(50);
    });

    it("should create entity with ideaExecutionPoints", () => {
      const input = {
        ...validInput,
        ideaExecutionPoints: 200,
      };

      const type = createKaizenTypeEntity(input);

      expect(type.ideaExecutionPoints).toBe(200);
    });

    it("should create entity with all optional fields", () => {
      const input = {
        ...validInput,
        description: "Complete description",
        ideaPoints: 30,
        ideaExecutionPoints: 150,
      };

      const type = createKaizenTypeEntity(input);

      expect(type.description).toBe("Complete description");
      expect(type.ideaPoints).toBe(30);
      expect(type.ideaExecutionPoints).toBe(150);
    });

    it("should handle zero points", () => {
      const input = {
        ...validInput,
        points: 0,
      };

      const type = createKaizenTypeEntity(input);

      expect(type.points).toBe(0);
    });
  });

  describe("updateKaizenTypeEntity", () => {
    const existingType: KaizenTypeEntity = {
      id: "type-123",
      organizationId: "org-123",
      name: "Original Name",
      points: 100,
      sequence: 0,
    };

    it("should update name", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
    });

    it("should update points", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        points: 200,
      });

      expect(updated.points).toBe(200);
    });

    it("should update description", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        description: "New description",
      });

      expect(updated.description).toBe("New description");
    });

    it("should update ideaPoints", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        ideaPoints: 75,
      });

      expect(updated.ideaPoints).toBe(75);
    });

    it("should update ideaExecutionPoints", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        ideaExecutionPoints: 250,
      });

      expect(updated.ideaExecutionPoints).toBe(250);
    });

    it("should increment sequence", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        name: "Updated",
      });

      expect(updated.sequence).toBe(1);
    });

    it("should preserve immutable fields", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        name: "Updated",
      });

      expect(updated.id).toBe("type-123");
      expect(updated.organizationId).toBe("org-123");
    });

    it("should handle multiple field updates", () => {
      const updated = updateKaizenTypeEntity(existingType, {
        name: "New Name",
        points: 150,
        description: "New desc",
        ideaPoints: 40,
        ideaExecutionPoints: 180,
      });

      expect(updated.name).toBe("New Name");
      expect(updated.points).toBe(150);
      expect(updated.description).toBe("New desc");
      expect(updated.ideaPoints).toBe(40);
      expect(updated.ideaExecutionPoints).toBe(180);
    });

    it("should handle consecutive updates", () => {
      const first = updateKaizenTypeEntity(existingType, { name: "First" });
      const second = updateKaizenTypeEntity(first, { points: 200 });
      const third = updateKaizenTypeEntity(second, { description: "Desc" });

      expect(third.name).toBe("First");
      expect(third.points).toBe(200);
      expect(third.description).toBe("Desc");
      expect(third.sequence).toBe(3);
    });

    it("should preserve existing optional fields when not updating them", () => {
      const typeWithOptionals: KaizenTypeEntity = {
        ...existingType,
        description: "Existing desc",
        ideaPoints: 50,
        ideaExecutionPoints: 100,
      };

      const updated = updateKaizenTypeEntity(typeWithOptionals, {
        name: "Updated Name",
      });

      expect(updated.description).toBe("Existing desc");
      expect(updated.ideaPoints).toBe(50);
      expect(updated.ideaExecutionPoints).toBe(100);
    });
  });
});
