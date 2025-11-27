import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GameController,
  GameRankingController,
  OrganizationGameController,
} from "./game.controller";
import { GameService } from "./game.service";

// Mock do tipo GameEntity
interface MockGameEntity {
  id: string;
  organizationId: string;
  projectId: string;
  gameManagerId: string;
  name: string;
  status: string;
  sequence: number;
  archived: number;
}

describe("GameController", () => {
  let controller: GameController;
  let service: GameService;

  const mockGame: MockGameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    gameManagerId: "gm-123",
    name: "Test Game",
    status: "active",
    sequence: 1,
    archived: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: {
            create: vi.fn().mockResolvedValue(mockGame),
            findById: vi.fn().mockResolvedValue(mockGame),
            listByOrganization: vi.fn().mockResolvedValue([mockGame]),
            listByProject: vi.fn().mockResolvedValue([mockGame]),
            update: vi.fn().mockResolvedValue(mockGame),
            remove: vi.fn().mockResolvedValue(undefined),
            archive: vi.fn().mockResolvedValue({ ...mockGame, archived: 1 }),
            unarchive: vi.fn().mockResolvedValue({ ...mockGame, archived: 0 }),
          },
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a game", async () => {
      const dto = {
        organizationId: "org-123",
        projectId: "proj-123",
        name: "New Game",
        gameManagerId: "gm-123",
      };

      const result = await controller.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe("game-123");
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it("should throw BadRequestException on error", async () => {
      vi.spyOn(service, "create").mockRejectedValue(new Error("Test error"));

      await expect(controller.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findOne", () => {
    it("should return a game by id", async () => {
      const result = await controller.findOne("game-123", "org-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("game-123");
      expect(service.findById).toHaveBeenCalledWith("org-123", "game-123");
    });

    it("should throw BadRequestException when organizationId is missing", async () => {
      await expect(controller.findOne("game-123", "")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw NotFoundException when game not found", async () => {
      vi.spyOn(service, "findById").mockResolvedValue(null);

      await expect(
        controller.findOne("nonexistent", "org-123"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByOrganization", () => {
    it("should list games for organization", async () => {
      const result = await controller.findByOrganization("org-123");

      expect(result.games).toHaveLength(1);
      expect(service.listByOrganization).toHaveBeenCalledWith("org-123");
    });

    it("should list games by project when projectId provided", async () => {
      const result = await controller.findByOrganization("org-123", "proj-123");

      expect(result.games).toBeDefined();
      expect(service.listByProject).toHaveBeenCalledWith("org-123", "proj-123");
    });

    it("should throw BadRequestException when organizationId is missing", async () => {
      await expect(controller.findByOrganization("")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("archive", () => {
    it("should archive a game", async () => {
      const result = await controller.archive("game-123", "org-123");

      expect(result).toBeDefined();
      expect(service.archive).toHaveBeenCalledWith("org-123", "game-123");
    });
  });

  describe("unarchive", () => {
    it("should unarchive a game", async () => {
      const result = await controller.unarchive("game-123", "org-123");

      expect(result).toBeDefined();
      expect(service.unarchive).toHaveBeenCalledWith("org-123", "game-123");
    });
  });
});

describe("OrganizationGameController", () => {
  let controller: OrganizationGameController;
  let service: GameService;

  const mockGame: MockGameEntity = {
    id: "game-123",
    organizationId: "org-123",
    projectId: "proj-123",
    gameManagerId: "gm-123",
    name: "Test Game",
    status: "active",
    sequence: 1,
    archived: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationGameController],
      providers: [
        {
          provide: GameService,
          useValue: {
            create: vi.fn().mockResolvedValue(mockGame),
            findById: vi.fn().mockResolvedValue(mockGame),
            listByOrganization: vi.fn().mockResolvedValue([mockGame]),
            update: vi.fn().mockResolvedValue(mockGame),
            remove: vi.fn().mockResolvedValue(undefined),
            archive: vi.fn().mockResolvedValue({ ...mockGame, archived: 1 }),
            unarchive: vi.fn().mockResolvedValue({ ...mockGame, archived: 0 }),
            getRanking: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationGameController>(
      OrganizationGameController,
    );
    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findByOrganization", () => {
    it("should list games for organization", async () => {
      const result = await controller.findByOrganization("org-123");

      expect(result.games).toHaveLength(1);
      expect(service.listByOrganization).toHaveBeenCalledWith("org-123");
    });
  });

  describe("create", () => {
    it("should create a game with organization ID from path", async () => {
      const dto = { name: "New Game", projectId: "proj-123" };

      const result = await controller.create("org-123", dto as any);

      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith({
        ...dto,
        organizationId: "org-123",
      });
    });
  });

  describe("update", () => {
    it("should update a game", async () => {
      const dto = { name: "Updated Name" };

      const result = await controller.update("org-123", "game-123", dto as any);

      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalledWith("org-123", "game-123", dto);
    });
  });

  describe("remove", () => {
    it("should delete a game", async () => {
      await controller.remove("org-123", "game-123");

      expect(service.remove).toHaveBeenCalledWith("org-123", "game-123");
    });
  });

  describe("archive", () => {
    it("should archive a game", async () => {
      const result = await controller.archive("org-123", "game-123");

      expect(result).toBeDefined();
      expect(service.archive).toHaveBeenCalledWith("org-123", "game-123");
    });
  });

  describe("unarchive", () => {
    it("should unarchive a game", async () => {
      const result = await controller.unarchive("org-123", "game-123");

      expect(result).toBeDefined();
      expect(service.unarchive).toHaveBeenCalledWith("org-123", "game-123");
    });
  });

  describe("getRanking", () => {
    it("should get game ranking grouped by user (default)", async () => {
      const mockRanking = [
        { userId: "user-1", name: "User 1", points: 100 },
        { userId: "user-2", name: "User 2", points: 80 },
      ];
      vi.spyOn(service, "getRanking").mockResolvedValue(mockRanking);

      const result = await controller.getRanking("org-123", "game-123");

      expect(result.ranking).toHaveLength(2);
      expect(service.getRanking).toHaveBeenCalledWith("game-123", "user");
    });

    it("should get game ranking grouped by team", async () => {
      const mockRanking = [{ teamId: "team-1", name: "Team 1", points: 200 }];
      vi.spyOn(service, "getRanking").mockResolvedValue(mockRanking);

      const result = await controller.getRanking("org-123", "game-123", "team");

      expect(result.ranking).toHaveLength(1);
      expect(service.getRanking).toHaveBeenCalledWith("game-123", "team");
    });
  });
});

describe("GameRankingController", () => {
  let controller: GameRankingController;
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameRankingController],
      providers: [
        {
          provide: GameService,
          useValue: {
            getRanking: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<GameRankingController>(GameRankingController);
    service = module.get<GameService>(GameService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getRanking", () => {
    it("should return user ranking by default", async () => {
      const mockRanking = [
        { userId: "user-1", name: "User 1", points: 150 },
        { userId: "user-2", name: "User 2", points: 120 },
      ];
      vi.spyOn(service, "getRanking").mockResolvedValue(mockRanking);

      const result = await controller.getRanking("game-123");

      expect(result.ranking).toHaveLength(2);
      expect(service.getRanking).toHaveBeenCalledWith(
        "game-123",
        "user",
        undefined,
      );
    });

    it("should return team ranking when specified", async () => {
      const mockRanking = [{ teamId: "team-1", name: "Team 1", points: 300 }];
      vi.spyOn(service, "getRanking").mockResolvedValue(mockRanking);

      const result = await controller.getRanking("game-123", "team");

      expect(result.ranking).toHaveLength(1);
      expect(service.getRanking).toHaveBeenCalledWith(
        "game-123",
        "team",
        undefined,
      );
    });

    it("should pass sectorId when provided", async () => {
      vi.spyOn(service, "getRanking").mockResolvedValue([]);

      await controller.getRanking("game-123", "user", "sector-123");

      expect(service.getRanking).toHaveBeenCalledWith(
        "game-123",
        "user",
        "sector-123",
      );
    });
  });
});
