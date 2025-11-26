import { describe, expect, it } from "vitest";
import {
  createActivityEntity,
  createMacrostepEntity,
  createMacrostepOrderEntity,
} from "./macrostep.entity";

describe("MacrostepEntity", () => {
  describe("createMacrostepEntity", () => {
    const validInput = {
      id: "macro-123",
      projectId: "proj-123",
      organizationId: "org-123",
      name: "Foundation Phase",
    };

    it("should create entity with required fields", () => {
      const macrostep = createMacrostepEntity(validInput);

      expect(macrostep.id).toBe("macro-123");
      expect(macrostep.projectId).toBe("proj-123");
      expect(macrostep.organizationId).toBe("org-123");
      expect(macrostep.name).toBe("Foundation Phase");
    });

    it("should set sequence to 0 by default", () => {
      const macrostep = createMacrostepEntity(validInput);

      expect(macrostep.sequence).toBe(0);
    });

    it("should create entity without optional fields by default", () => {
      const macrostep = createMacrostepEntity(validInput);

      expect(macrostep.description).toBeUndefined();
      expect(macrostep.startDate).toBeUndefined();
      expect(macrostep.endDate).toBeUndefined();
    });

    it("should create entity with description", () => {
      const input = {
        ...validInput,
        description: "Initial construction phase",
      };

      const macrostep = createMacrostepEntity(input);

      expect(macrostep.description).toBe("Initial construction phase");
    });

    it("should create entity with date range", () => {
      const input = {
        ...validInput,
        startDate: "2025-01-01",
        endDate: "2025-03-31",
      };

      const macrostep = createMacrostepEntity(input);

      expect(macrostep.startDate).toBe("2025-01-01");
      expect(macrostep.endDate).toBe("2025-03-31");
    });

    it("should create entity with all optional fields", () => {
      const input = {
        ...validInput,
        description: "Full description",
        startDate: "2025-02-01",
        endDate: "2025-04-30",
      };

      const macrostep = createMacrostepEntity(input);

      expect(macrostep.description).toBe("Full description");
      expect(macrostep.startDate).toBe("2025-02-01");
      expect(macrostep.endDate).toBe("2025-04-30");
    });
  });

  describe("createActivityEntity", () => {
    const validInput = {
      id: "act-123",
      macrostepId: "macro-123",
      projectId: "proj-123",
      organizationId: "org-123",
      name: "Excavation",
    };

    it("should create entity with required fields", () => {
      const activity = createActivityEntity(validInput);

      expect(activity.id).toBe("act-123");
      expect(activity.macrostepId).toBe("macro-123");
      expect(activity.projectId).toBe("proj-123");
      expect(activity.organizationId).toBe("org-123");
      expect(activity.name).toBe("Excavation");
    });

    it("should set sequence to 0 by default", () => {
      const activity = createActivityEntity(validInput);

      expect(activity.sequence).toBe(0);
    });

    it("should create entity without optional fields by default", () => {
      const activity = createActivityEntity(validInput);

      expect(activity.description).toBeUndefined();
      expect(activity.unityCost).toBeUndefined();
      expect(activity.unityQuantity).toBeUndefined();
      expect(activity.startDate).toBeUndefined();
      expect(activity.endDate).toBeUndefined();
    });

    it("should create entity with description", () => {
      const input = {
        ...validInput,
        description: "Site excavation work",
      };

      const activity = createActivityEntity(input);

      expect(activity.description).toBe("Site excavation work");
    });

    it("should create entity with cost information", () => {
      const input = {
        ...validInput,
        unityCost: 150.5,
        unityQuantity: 100,
      };

      const activity = createActivityEntity(input);

      expect(activity.unityCost).toBe(150.5);
      expect(activity.unityQuantity).toBe(100);
    });

    it("should create entity with date range", () => {
      const input = {
        ...validInput,
        startDate: "2025-01-15",
        endDate: "2025-01-25",
      };

      const activity = createActivityEntity(input);

      expect(activity.startDate).toBe("2025-01-15");
      expect(activity.endDate).toBe("2025-01-25");
    });

    it("should create entity with all optional fields", () => {
      const input = {
        ...validInput,
        description: "Complete activity",
        unityCost: 200,
        unityQuantity: 50,
        startDate: "2025-02-01",
        endDate: "2025-02-15",
      };

      const activity = createActivityEntity(input);

      expect(activity.description).toBe("Complete activity");
      expect(activity.unityCost).toBe(200);
      expect(activity.unityQuantity).toBe(50);
      expect(activity.startDate).toBe("2025-02-01");
      expect(activity.endDate).toBe("2025-02-15");
    });
  });

  describe("createMacrostepOrderEntity", () => {
    const validInput = {
      projectId: "proj-123",
      organizationId: "org-123",
      macrostepIds: ["macro-1", "macro-2", "macro-3"],
    };

    it("should create entity with required fields", () => {
      const order = createMacrostepOrderEntity(validInput);

      expect(order.projectId).toBe("proj-123");
      expect(order.organizationId).toBe("org-123");
      expect(order.macrostepIds).toEqual(["macro-1", "macro-2", "macro-3"]);
    });

    it("should set sequence to 0 by default", () => {
      const order = createMacrostepOrderEntity(validInput);

      expect(order.sequence).toBe(0);
    });

    it("should handle empty macrostepIds array", () => {
      const input = {
        ...validInput,
        macrostepIds: [],
      };

      const order = createMacrostepOrderEntity(input);

      expect(order.macrostepIds).toEqual([]);
    });

    it("should handle single macrostepId", () => {
      const input = {
        ...validInput,
        macrostepIds: ["macro-only"],
      };

      const order = createMacrostepOrderEntity(input);

      expect(order.macrostepIds).toEqual(["macro-only"]);
    });

    it("should preserve order of macrostepIds", () => {
      const input = {
        ...validInput,
        macrostepIds: ["third", "first", "second"],
      };

      const order = createMacrostepOrderEntity(input);

      expect(order.macrostepIds[0]).toBe("third");
      expect(order.macrostepIds[1]).toBe("first");
      expect(order.macrostepIds[2]).toBe("second");
    });
  });
});
