import { describe, it, expect } from "vitest";
import {
  createTaskTemplateEntity,
  updateTaskTemplateEntity,
  type TaskTemplateEntity,
} from "./task-template.entity";

describe("TaskTemplateEntity", () => {
  describe("createTaskTemplateEntity", () => {
    const validInput = {
      id: "template-123",
      organizationId: "org-123",
      kpiId: "kpi-123",
      name: "Daily Inspection",
      rewardPoints: 50,
    };

    it("should create entity with required fields", () => {
      const template = createTaskTemplateEntity(validInput);

      expect(template.id).toBe("template-123");
      expect(template.organizationId).toBe("org-123");
      expect(template.kpiId).toBe("kpi-123");
      expect(template.name).toBe("Daily Inspection");
      expect(template.rewardPoints).toBe(50);
    });

    it("should create entity without optional fields by default", () => {
      const template = createTaskTemplateEntity(validInput);

      expect(template.description).toBeUndefined();
      expect(template.measurementUnit).toBeUndefined();
      expect(template.totalMeasurementExpected).toBeUndefined();
    });

    it("should create entity with description", () => {
      const input = {
        ...validInput,
        description: "Perform daily safety inspection",
      };

      const template = createTaskTemplateEntity(input);

      expect(template.description).toBe("Perform daily safety inspection");
    });

    it("should create entity with measurement unit", () => {
      const input = {
        ...validInput,
        measurementUnit: "inspection",
      };

      const template = createTaskTemplateEntity(input);

      expect(template.measurementUnit).toBe("inspection");
    });

    it("should create entity with total measurement expected", () => {
      const input = {
        ...validInput,
        totalMeasurementExpected: "100",
      };

      const template = createTaskTemplateEntity(input);

      expect(template.totalMeasurementExpected).toBe("100");
    });

    it("should create entity with all optional fields", () => {
      const input = {
        ...validInput,
        description: "Complete template",
        measurementUnit: "units",
        totalMeasurementExpected: "50",
      };

      const template = createTaskTemplateEntity(input);

      expect(template.description).toBe("Complete template");
      expect(template.measurementUnit).toBe("units");
      expect(template.totalMeasurementExpected).toBe("50");
    });

    it("should handle zero reward points", () => {
      const input = {
        ...validInput,
        rewardPoints: 0,
      };

      const template = createTaskTemplateEntity(input);

      expect(template.rewardPoints).toBe(0);
    });
  });

  describe("updateTaskTemplateEntity", () => {
    const existingTemplate: TaskTemplateEntity = {
      id: "template-123",
      organizationId: "org-123",
      kpiId: "kpi-123",
      name: "Original Template",
      rewardPoints: 50,
    };

    it("should update name", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        name: "Updated Template",
      });

      expect(updated.name).toBe("Updated Template");
    });

    it("should update kpiId", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        kpiId: "kpi-456",
      });

      expect(updated.kpiId).toBe("kpi-456");
    });

    it("should update rewardPoints", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        rewardPoints: 100,
      });

      expect(updated.rewardPoints).toBe(100);
    });

    it("should update description", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        description: "New description",
      });

      expect(updated.description).toBe("New description");
    });

    it("should update measurementUnit", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        measurementUnit: "meters",
      });

      expect(updated.measurementUnit).toBe("meters");
    });

    it("should update totalMeasurementExpected", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        totalMeasurementExpected: "200",
      });

      expect(updated.totalMeasurementExpected).toBe("200");
    });

    it("should preserve immutable fields", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        name: "Updated",
      });

      expect(updated.id).toBe("template-123");
      expect(updated.organizationId).toBe("org-123");
    });

    it("should preserve unchanged fields", () => {
      const templateWithOptionals: TaskTemplateEntity = {
        ...existingTemplate,
        description: "Existing desc",
        measurementUnit: "units",
      };

      const updated = updateTaskTemplateEntity(templateWithOptionals, {
        name: "Updated Name",
      });

      expect(updated.description).toBe("Existing desc");
      expect(updated.measurementUnit).toBe("units");
    });

    it("should handle multiple field updates", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        name: "New Name",
        rewardPoints: 75,
        description: "New desc",
        measurementUnit: "kg",
        totalMeasurementExpected: "1000",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.rewardPoints).toBe(75);
      expect(updated.description).toBe("New desc");
      expect(updated.measurementUnit).toBe("kg");
      expect(updated.totalMeasurementExpected).toBe("1000");
    });

    it("should handle changing kpi", () => {
      const updated = updateTaskTemplateEntity(existingTemplate, {
        kpiId: "new-kpi-id",
      });

      expect(updated.kpiId).toBe("new-kpi-id");
      expect(updated.name).toBe("Original Template");
    });
  });
});
