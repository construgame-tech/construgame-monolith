import { describe, it, expect, vi } from "vitest";
import { creditUserTaskPoints } from "./credit-user-task-points";
import type { IUserGamePointsRepository } from "../repositories/game-points.repository.interface";

describe("creditUserTaskPoints use case", () => {
  const mockRepository: IUserGamePointsRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    findByUserAndGame: vi.fn(),
    findByGameId: vi.fn(),
    getLeaderboard: vi.fn(),
  };

  it("should create new user points when user has no existing points", async () => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.findByUserAndGame).mockResolvedValue(null);

    const input = {
      userId: "user-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      pointsToCredit: 100,
    };

    const { userPoints } = await creditUserTaskPoints(input, mockRepository);

    expect(userPoints).toBeDefined();
    expect(userPoints.userId).toBe("user-123");
    expect(userPoints.gameId).toBe("game-456");
    expect(userPoints.organizationId).toBe("org-789");
    expect(userPoints.projectId).toBe("proj-101");
    expect(userPoints.taskPoints).toBe(100);
    expect(userPoints.kaizenPoints).toBe(0);
    expect(userPoints.totalPoints).toBe(100);
    expect(mockRepository.findByUserAndGame).toHaveBeenCalledWith("user-123", "game-456");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should add points to existing user points", async () => {
    vi.clearAllMocks();
    
    const existingPoints = {
      userId: "user-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      taskPoints: 50,
      kaizenPoints: 30,
      totalPoints: 80,
    };
    
    vi.mocked(mockRepository.findByUserAndGame).mockResolvedValue(existingPoints);

    const input = {
      userId: "user-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      pointsToCredit: 100,
    };

    const { userPoints } = await creditUserTaskPoints(input, mockRepository);

    expect(userPoints.taskPoints).toBe(150); // 50 + 100
    expect(userPoints.kaizenPoints).toBe(30); // Unchanged
    expect(userPoints.totalPoints).toBe(180); // 150 + 30
    expect(mockRepository.save).toHaveBeenCalledWith(userPoints);
  });

  it("should handle zero points to credit", async () => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.findByUserAndGame).mockResolvedValue(null);

    const input = {
      userId: "user-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      pointsToCredit: 0,
    };

    const { userPoints } = await creditUserTaskPoints(input, mockRepository);

    expect(userPoints.taskPoints).toBe(0);
    expect(userPoints.totalPoints).toBe(0);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
