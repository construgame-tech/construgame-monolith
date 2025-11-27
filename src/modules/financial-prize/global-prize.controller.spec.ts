import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { GlobalPrizeController } from "./global-prize.controller";

describe("GlobalPrizeController", () => {
  let controller: GlobalPrizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalPrizeController],
    }).compile();

    controller = module.get<GlobalPrizeController>(GlobalPrizeController);
  });

  describe("listGlobalPrizes", () => {
    it("should return empty items array", async () => {
      // Act
      const result = await controller.listGlobalPrizes();

      // Assert
      expect(result).toEqual({ items: [] });
    });
  });

  describe("listPrizesByResource", () => {
    it("should return empty items for project resource", async () => {
      // Arrange
      const organizationId = "org-123";
      const resourceType = "project";
      const resourceId = "project-123";

      // Act
      const result = await controller.listPrizesByResource(
        organizationId,
        resourceType,
        resourceId,
      );

      // Assert
      expect(result).toEqual({ items: [] });
    });

    it("should return empty items for user resource", async () => {
      // Arrange
      const organizationId = "org-123";
      const resourceType = "user";
      const resourceId = "user-123";

      // Act
      const result = await controller.listPrizesByResource(
        organizationId,
        resourceType,
        resourceId,
      );

      // Assert
      expect(result).toEqual({ items: [] });
    });

    it("should return empty items for member resource", async () => {
      // Arrange
      const organizationId = "org-123";
      const resourceType = "member";
      const resourceId = "member-123";

      // Act
      const result = await controller.listPrizesByResource(
        organizationId,
        resourceType,
        resourceId,
      );

      // Assert
      expect(result).toEqual({ items: [] });
    });

    it("should return empty items for task resource", async () => {
      // Arrange
      const organizationId = "org-123";
      const resourceType = "task";
      const resourceId = "task-123";

      // Act
      const result = await controller.listPrizesByResource(
        organizationId,
        resourceType,
        resourceId,
      );

      // Assert
      expect(result).toEqual({ items: [] });
    });

    it("should return empty items for activity resource", async () => {
      // Arrange
      const organizationId = "org-123";
      const resourceType = "activity";
      const resourceId = "activity-123";

      // Act
      const result = await controller.listPrizesByResource(
        organizationId,
        resourceType,
        resourceId,
      );

      // Assert
      expect(result).toEqual({ items: [] });
    });

    it("should return empty items for organization resource", async () => {
      // Arrange
      const organizationId = "org-123";
      const resourceType = "organization";
      const resourceId = "org-123";

      // Act
      const result = await controller.listPrizesByResource(
        organizationId,
        resourceType,
        resourceId,
      );

      // Assert
      expect(result).toEqual({ items: [] });
    });
  });
});
