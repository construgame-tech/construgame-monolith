import type { DrizzleDB } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameService } from "./game.service";

describe("GameService", () => {
  let service: GameService;
  let repository: GameRepository;
  let mockDb: DrizzleDB;

  beforeEach(async () => {
    // Mock do Drizzle DB para getRanking
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    } as unknown as DrizzleDB;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: GameRepository,
          useValue: {
            save: vi.fn(),
            findById: vi.fn(),
            findByOrganizationId: vi.fn(),
            findByProjectId: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: "DRIZZLE_CONNECTION",
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    repository = module.get<GameRepository>(GameRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe("getRanking", () => {
    it("should return user ranking when groupBy is user", async () => {
      // Arrange
      const gameId = "game-123";
      const mockUserPoints = [
        { userId: "user-1", totalPoints: 100 },
        { userId: "user-2", totalPoints: 80 },
        { userId: "user-3", totalPoints: 60 },
      ];

      mockDb.orderBy = vi.fn().mockResolvedValue(mockUserPoints);

      // Act
      const result = await service.getRanking(gameId, "user");

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        userId: "user-1",
        name: "user-1",
        points: 100,
      });
      expect(result[1]).toEqual({
        userId: "user-2",
        name: "user-2",
        points: 80,
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should return team ranking when groupBy is team", async () => {
      // Arrange
      const gameId = "game-456";
      const mockTeamPoints = [
        { teamId: "team-1", totalPoints: 250 },
        { teamId: "team-2", totalPoints: 200 },
      ];

      mockDb.orderBy = vi.fn().mockResolvedValue(mockTeamPoints);

      // Act
      const result = await service.getRanking(gameId, "team");

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        teamId: "team-1",
        name: "team-1",
        points: 250,
      });
      expect(result[1]).toEqual({
        teamId: "team-2",
        name: "team-2",
        points: 200,
      });
    });

    it("should return empty array when no rankings exist", async () => {
      // Arrange
      const gameId = "game-empty";
      mockDb.orderBy = vi.fn().mockResolvedValue([]);

      // Act
      const result = await service.getRanking(gameId, "user");

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle sectorId parameter (currently ignored)", async () => {
      // Arrange
      const gameId = "game-789";
      const sectorId = "sector-123";
      mockDb.orderBy = vi.fn().mockResolvedValue([]);

      // Act
      const result = await service.getRanking(gameId, "user", sectorId);

      // Assert
      expect(result).toBeDefined();
      // sectorId é recebido mas não usado atualmente
    });
  });

  describe("create", () => {
    it("should create a game successfully", async () => {
      // Arrange
      const createDto = {
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Test Game",
        gameManagerId: "gm-123",
      };

      vi.spyOn(repository, "save").mockResolvedValue(undefined);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toHaveProperty("id");
      expect(result.name).toBe("Test Game");
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("listByOrganization", () => {
    it("should list games by organization", async () => {
      // Arrange
      const orgId = "org-123";
      const mockGames = [
        { id: "game-1", name: "Game 1", organizationId: orgId },
        { id: "game-2", name: "Game 2", organizationId: orgId },
      ];

      vi.spyOn(repository, "findByOrganizationId").mockResolvedValue(
        mockGames as any,
      );

      // Act
      const result = await service.listByOrganization(orgId);

      // Assert
      expect(result).toHaveLength(2);
      expect(repository.findByOrganizationId).toHaveBeenCalledWith(orgId);
    });
  });

  describe("listByProject", () => {
    it("should list games by project", async () => {
      // Arrange
      const orgId = "org-123";
      const projectId = "proj-123";
      const mockGames = [{ id: "game-1", name: "Game 1", projectId }];

      vi.spyOn(repository, "findByProjectId").mockResolvedValue(
        mockGames as any,
      );

      // Act
      const result = await service.listByProject(orgId, projectId);

      // Assert
      expect(result).toHaveLength(1);
      expect(repository.findByProjectId).toHaveBeenCalledWith(orgId, projectId);
    });
  });

  describe("archive", () => {
    it("should archive a game", async () => {
      // Arrange
      const orgId = "org-123";
      const gameId = "game-123";
      const mockGame = {
        id: gameId,
        organizationId: orgId,
        name: "Test Game",
        archived: 0,
      };

      vi.spyOn(repository, "findById").mockResolvedValue(mockGame as any);
      vi.spyOn(repository, "save").mockResolvedValue(undefined);

      // Act
      const result = await service.archive(orgId, gameId);

      // Assert
      expect(result).toBeDefined();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe("unarchive", () => {
    it("should unarchive a game", async () => {
      // Arrange
      const orgId = "org-123";
      const gameId = "game-123";
      const mockGame = {
        id: gameId,
        organizationId: orgId,
        name: "Test Game",
        archived: 1,
      };

      vi.spyOn(repository, "findById").mockResolvedValue(mockGame as any);
      vi.spyOn(repository, "save").mockResolvedValue(undefined);

      // Act
      const result = await service.unarchive(orgId, gameId);

      // Assert
      expect(result).toBeDefined();
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
