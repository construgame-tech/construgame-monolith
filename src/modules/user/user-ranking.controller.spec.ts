import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { UserRankingController } from "./user-ranking.controller";

describe("UserRankingController", () => {
  let controller: UserRankingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRankingController],
    }).compile();

    controller = module.get<UserRankingController>(UserRankingController);
  });

  describe("getUserRanking", () => {
    it("should return empty rankings array", async () => {
      // Arrange
      const organizationId = "org-123";
      const userId = "user-123";

      // Act
      const result = await controller.getUserRanking(organizationId, userId);

      // Assert
      expect(result).toEqual({ rankings: [] });
    });

    it("should accept different organization and user IDs", async () => {
      // Arrange
      const organizationId = "org-456";
      const userId = "user-456";

      // Act
      const result = await controller.getUserRanking(organizationId, userId);

      // Assert
      expect(result).toEqual({ rankings: [] });
    });
  });
});
