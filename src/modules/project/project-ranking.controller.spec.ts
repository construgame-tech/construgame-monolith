import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectService } from "./project.service";
import {
  ProjectRankingController,
  ProjectReportController,
} from "./project-ranking.controller";

describe("ProjectRankingController", () => {
  let controller: ProjectRankingController;

  const mockProjectService = {
    createProject: vi.fn(),
    getProject: vi.fn(),
    listByOrganization: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectRankingController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectRankingController>(ProjectRankingController);
  });

  describe("getProjectRanking", () => {
    it("should return empty ranking", async () => {
      // Arrange
      const projectId = "project-123";

      // Act
      const result = await controller.getProjectRanking(projectId);

      // Assert
      expect(result).toEqual({ ranking: [] });
    });

    it("should accept groupBy parameter", async () => {
      // Arrange
      const projectId = "project-123";
      const groupBy = "team";

      // Act
      const result = await controller.getProjectRanking(projectId, groupBy);

      // Assert
      expect(result).toEqual({ ranking: [] });
    });

    it("should accept sectorId parameter", async () => {
      // Arrange
      const projectId = "project-123";
      const sectorId = "sector-123";

      // Act
      const result = await controller.getProjectRanking(
        projectId,
        undefined,
        sectorId,
      );

      // Assert
      expect(result).toEqual({ ranking: [] });
    });
  });
});

describe("ProjectReportController", () => {
  let controller: ProjectReportController;

  const mockProjectService = {
    createProject: vi.fn(),
    getProject: vi.fn(),
    listByOrganization: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectReportController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectReportController>(ProjectReportController);
  });

  describe("getProjectReport", () => {
    it("should return report URL stub", async () => {
      // Arrange
      const organizationId = "org-123";
      const projectId = "project-123";

      // Act
      const result = await controller.getProjectReport(
        organizationId,
        projectId,
      );

      // Assert
      expect(result).toHaveProperty("reportUrl");
      expect(result.reportUrl).toBe("");
    });
  });
});
