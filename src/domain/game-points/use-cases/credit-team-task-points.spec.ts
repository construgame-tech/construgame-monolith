import { describe, it, expect, vi } from "vitest";
import { creditTeamTaskPoints } from "./credit-team-task-points";
import type { ITeamGamePointsRepository } from "../repositories/game-points.repository.interface";

describe("creditTeamTaskPoints use case", () => {
  const mockRepository: ITeamGamePointsRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    findByTeamAndGame: vi.fn(),
    findByGameId: vi.fn(),
    getLeaderboard: vi.fn(),
  };

  it("should create new team points when team has no existing points", async () => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.findByTeamAndGame).mockResolvedValue(null);

    const input = {
      teamId: "team-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      pointsToCredit: 200,
    };

    const { teamPoints } = await creditTeamTaskPoints(input, mockRepository);

    expect(teamPoints).toBeDefined();
    expect(teamPoints.teamId).toBe("team-123");
    expect(teamPoints.gameId).toBe("game-456");
    expect(teamPoints.organizationId).toBe("org-789");
    expect(teamPoints.projectId).toBe("proj-101");
    expect(teamPoints.taskPoints).toBe(200);
    expect(teamPoints.kaizenPoints).toBe(0);
    expect(teamPoints.totalPoints).toBe(200);
    expect(mockRepository.findByTeamAndGame).toHaveBeenCalledWith("team-123", "game-456");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should add points to existing team points", async () => {
    vi.clearAllMocks();
    
    const existingPoints = {
      teamId: "team-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      taskPoints: 100,
      kaizenPoints: 50,
      totalPoints: 150,
    };
    
    vi.mocked(mockRepository.findByTeamAndGame).mockResolvedValue(existingPoints);

    const input = {
      teamId: "team-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      pointsToCredit: 200,
    };

    const { teamPoints } = await creditTeamTaskPoints(input, mockRepository);

    expect(teamPoints.taskPoints).toBe(300); // 100 + 200
    expect(teamPoints.kaizenPoints).toBe(50); // Unchanged
    expect(teamPoints.totalPoints).toBe(350); // 300 + 50
    expect(mockRepository.save).toHaveBeenCalledWith(teamPoints);
  });

  it("should handle zero points to credit", async () => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.findByTeamAndGame).mockResolvedValue(null);

    const input = {
      teamId: "team-123",
      gameId: "game-456",
      organizationId: "org-789",
      projectId: "proj-101",
      pointsToCredit: 0,
    };

    const { teamPoints } = await creditTeamTaskPoints(input, mockRepository);

    expect(teamPoints.taskPoints).toBe(0);
    expect(teamPoints.totalPoints).toBe(0);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
