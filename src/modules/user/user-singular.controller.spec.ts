import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameRepository } from "../../infrastructure/repositories/game.repository";
import { TaskRepository } from "../../infrastructure/repositories/task.repository";
import { UserService } from "./user.service";
import { UserSingularController } from "./user-singular.controller";

describe("UserSingularController", () => {
  let controller: UserSingularController;

  const mockUserService = {
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockTaskRepository = {
    findByUserId: vi.fn(),
  };

  const mockGameRepository = {
    findByOrganizationId: vi.fn(),
  };

  const mockTaskUpdateRepository = {
    findBySubmitterId: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSingularController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: GameRepository, useValue: mockGameRepository },
        { provide: "TaskUpdateRepository", useValue: mockTaskUpdateRepository },
      ],
    }).compile();

    controller = module.get<UserSingularController>(UserSingularController);

    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findOne", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser = {
        id: "user-123",
        name: "Test User",
        email: "test@test.com",
      };
      mockUserService.findById.mockResolvedValue({ user: mockUser });

      // Act
      const result = await controller.findOne("user-123");

      // Assert
      expect(result).toBeDefined();
      expect(mockUserService.findById).toHaveBeenCalledWith("user-123");
    });

    it("should throw NotFoundException when user not found", async () => {
      // Arrange
      mockUserService.findById.mockRejectedValue(new Error("User not found"));

      // Act & Assert
      await expect(controller.findOne("nonexistent")).rejects.toThrow();
    });
  });

  describe("replace", () => {
    it("should update user when valid data provided", async () => {
      // Arrange
      const mockUser = {
        id: "user-123",
        name: "Updated Name",
        email: "test@test.com",
      };
      mockUserService.update.mockResolvedValue({ user: mockUser });

      // Act
      const result = await controller.replace("user-123", {
        name: "Updated Name",
      });

      // Assert
      expect(result).toBeDefined();
      expect(mockUserService.update).toHaveBeenCalledWith("user-123", {
        name: "Updated Name",
      });
    });
  });

  describe("update", () => {
    it("should update user with partial data", async () => {
      // Arrange
      const mockUser = {
        id: "user-123",
        name: "Patched Name",
        email: "test@test.com",
      };
      mockUserService.update.mockResolvedValue({ user: mockUser });

      // Act
      const result = await controller.update("user-123", {
        name: "Patched Name",
      });

      // Assert
      expect(result).toBeDefined();
      expect(mockUserService.update).toHaveBeenCalledWith("user-123", {
        name: "Patched Name",
      });
    });
  });

  describe("remove", () => {
    it("should delete user successfully", async () => {
      // Arrange
      mockUserService.delete.mockResolvedValue(undefined);

      // Act
      await controller.remove("user-123");

      // Assert
      expect(mockUserService.delete).toHaveBeenCalledWith("user-123");
    });
  });

  describe("registerPushToken", () => {
    it("should register push token and return success message", async () => {
      // Act
      const result = await controller.registerPushToken(
        "user-123",
        "ExponentPushToken[xxx]",
      );

      // Assert
      expect(result).toHaveProperty("message");
      expect(result.message).toContain("registered successfully");
    });
  });

  describe("removePushToken", () => {
    it("should remove push token and return success message", async () => {
      // Act
      const result = await controller.removePushToken(
        "user-123",
        "ExponentPushToken[xxx]",
      );

      // Assert
      expect(result).toHaveProperty("message");
      expect(result.message).toContain("removed successfully");
    });
  });

  describe("listUserTasksForGame", () => {
    it("should return filtered tasks for game", async () => {
      // Arrange
      const mockTasks = [
        { id: "task-1", gameId: "game-123", startDate: "2024-01-01" },
        { id: "task-2", gameId: "game-123", startDate: "2024-02-01" },
        { id: "task-3", gameId: "other-game", startDate: "2024-01-01" },
      ];
      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);

      // Act
      const result = await controller.listUserTasksForGame(
        "user-123",
        "game-123",
      );

      // Assert
      expect(result.items).toHaveLength(2);
      expect(
        result.items.every((t: { gameId: string }) => t.gameId === "game-123"),
      ).toBe(true);
    });

    it("should apply date filters when provided", async () => {
      // Arrange
      const mockTasks = [
        {
          id: "task-1",
          gameId: "game-123",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
        {
          id: "task-2",
          gameId: "game-123",
          startDate: "2024-06-01",
          endDate: "2024-06-30",
        },
      ];
      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);

      // Act
      const result = await controller.listUserTasksForGame(
        "user-123",
        "game-123",
        "2024-03-01", // startDateBefore
        "2024-01-15", // endDateAfter
      );

      // Assert
      expect(result.items).toHaveLength(1);
      expect((result.items[0] as { id: string }).id).toBe("task-1");
    });
  });

  describe("listUserGamesForOrganization", () => {
    it("should return games where user has tasks", async () => {
      // Arrange
      const mockGames = [
        { id: "game-1", archived: false },
        { id: "game-2", archived: false },
        { id: "game-3", archived: true },
      ];
      const mockTasks = [
        { id: "task-1", gameId: "game-1" },
        { id: "task-2", gameId: "game-1" },
      ];
      mockGameRepository.findByOrganizationId.mockResolvedValue(mockGames);
      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);

      // Act
      const result = await controller.listUserGamesForOrganization(
        "user-123",
        "org-123",
      );

      // Assert
      expect(result.items).toHaveLength(1);
      expect((result.items[0] as { id: string }).id).toBe("game-1");
    });
  });

  describe("listUserTaskUpdates", () => {
    it("should return task updates with pagination", async () => {
      // Arrange
      const mockUpdates = [
        { id: "update-1", status: "PENDING_REVIEW", taskId: "task-1" },
        { id: "update-2", status: "ACCEPTED", taskId: "task-2" },
      ];
      mockTaskUpdateRepository.findBySubmitterId.mockResolvedValue(mockUpdates);

      // Act
      const result = await controller.listUserTaskUpdates(
        "user-123",
        "org-123",
      );

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("total");
    });

    it("should filter by status when provided", async () => {
      // Arrange
      const mockUpdates = [
        { id: "update-1", status: "PENDING_REVIEW", taskId: "task-1" },
        { id: "update-2", status: "ACCEPTED", taskId: "task-2" },
      ];
      mockTaskUpdateRepository.findBySubmitterId.mockResolvedValue(mockUpdates);

      // Act
      const result = await controller.listUserTaskUpdates(
        "user-123",
        "org-123",
        "PENDING_REVIEW",
      );

      // Assert
      expect(result.items).toHaveLength(1);
      expect((result.items[0] as { status: string }).status).toBe(
        "PENDING_REVIEW",
      );
    });

    it("should apply pagination parameters", async () => {
      // Arrange
      const mockUpdates = Array.from({ length: 25 }, (_, i) => ({
        id: `update-${i}`,
        status: "PENDING_REVIEW",
        taskId: `task-${i}`,
      }));
      mockTaskUpdateRepository.findBySubmitterId.mockResolvedValue(mockUpdates);

      // Act
      const result = await controller.listUserTaskUpdates(
        "user-123",
        "org-123",
        undefined,
        undefined,
        undefined,
        undefined,
        2,
        10,
      );

      // Assert
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.items).toHaveLength(10);
    });
  });
});
