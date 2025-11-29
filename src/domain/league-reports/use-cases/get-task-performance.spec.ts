// Testes para os use cases de performance de tasks
// Verifica performance por projeto, game e melhores jogadores

import { describe, expect, it, vi } from "vitest";

import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import type { ITaskReportsRepository } from "../repositories/task-reports.repository.interface";
import {
  getTaskBestPlayers,
  getTaskPerformancePerGame,
  getTaskPerformancePerProject,
} from "./get-task-performance";

// Factory para criar mocks reutilizáveis
const createMockLeagueDataRepository = (
  projectIds: string[] = [],
  gameIds: string[] = [],
): ILeagueDataRepository => ({
  findById: vi.fn(),
  getProjectIds: vi.fn().mockResolvedValue(projectIds),
  getGameIds: vi.fn().mockResolvedValue(gameIds),
});

const createMockTaskReportsRepository = (
  overrides: Partial<ITaskReportsRepository> = {},
): ITaskReportsRepository => ({
  getCounters: vi.fn().mockResolvedValue({
    playerTaskCount: 0,
    teamTaskCount: 0,
    distinctPlayerCount: 0,
    distinctTeamCount: 0,
  }),
  getPerformancePerProject: vi.fn().mockResolvedValue([]),
  getPerformancePerGame: vi.fn().mockResolvedValue([]),
  getBestPlayers: vi.fn().mockResolvedValue([]),
  ...overrides,
});

describe("getTaskPerformancePerProject", () => {
  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([], []);
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskPerformancePerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toEqual([]);
    expect(taskReportsRepo.getPerformancePerProject).not.toHaveBeenCalled();
  });

  it("deve retornar array vazio quando não há games", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"], []);
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskPerformancePerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toEqual([]);
    expect(taskReportsRepo.getPerformancePerProject).not.toHaveBeenCalled();
  });

  it("deve retornar performance por projeto com KPIs dinâmicos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1", "proj-2"],
      ["game-1", "game-2"],
    );
    const taskReportsRepo = createMockTaskReportsRepository({
      getPerformancePerProject: vi.fn().mockResolvedValue([
        { projectName: "Projeto 1", "kpi-1": 85, "kpi-2": 72 },
        { projectName: "Projeto 2", "kpi-1": 90, "kpi-2": 65 },
      ]),
    });

    const result = await getTaskPerformancePerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toHaveProperty("kpi-1", 85);
    expect(result.items[0]).toHaveProperty("kpi-2", 72);
  });

  it("deve passar filtros corretos para o repositório", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1"],
      ["game-1"],
    );
    const taskReportsRepo = createMockTaskReportsRepository();

    await getTaskPerformancePerProject(
      { organizationId: "org-1", leagueId: "league-1", sectorId: "sector-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(taskReportsRepo.getPerformancePerProject).toHaveBeenCalledWith(
      {
        organizationId: "org-1",
        gameIds: ["game-1"],
        sectorId: "sector-1",
      },
      ["proj-1"],
    );
  });
});

describe("getTaskPerformancePerGame", () => {
  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([], []);
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskPerformancePerGame(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toEqual([]);
  });

  it("deve retornar performance por game com KPIs aninhados", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1"],
      ["game-1", "game-2"],
    );
    const taskReportsRepo = createMockTaskReportsRepository({
      getPerformancePerGame: vi.fn().mockResolvedValue([
        {
          gameId: "game-1",
          gameName: "Game 1",
          projectName: "Projeto 1",
          kpis: { "kpi-1": 80, "kpi-2": 75 },
        },
        {
          gameId: "game-2",
          gameName: "Game 2",
          projectName: "Projeto 1",
          kpis: { "kpi-1": 85, "kpi-2": 70 },
        },
      ]),
    });

    const result = await getTaskPerformancePerGame(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].kpis["kpi-1"]).toBe(80);
    expect(result.items[1].gameId).toBe("game-2");
  });
});

describe("getTaskBestPlayers", () => {
  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([], []);
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskBestPlayers(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toEqual([]);
  });

  it("deve retornar array vazio quando não há games", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"], []);
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskBestPlayers(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toEqual([]);
  });

  it("deve retornar melhores jogadores ordenados por progresso", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1"],
      ["game-1"],
    );
    const taskReportsRepo = createMockTaskReportsRepository({
      getBestPlayers: vi.fn().mockResolvedValue([
        {
          progressPercent: 95,
          kpiId: "kpi-1",
          playerName: "João",
          playerPhoto: "joao.jpg",
          userId: "user-1",
          teamName: "Time A",
          teamPhoto: "team-a.jpg",
          teamId: "team-1",
        },
        {
          progressPercent: 88,
          kpiId: "kpi-1",
          playerName: "Maria",
          playerPhoto: "maria.jpg",
          userId: "user-2",
          teamName: "Time B",
          teamPhoto: "team-b.jpg",
          teamId: "team-2",
        },
      ]),
    });

    const result = await getTaskBestPlayers(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].progressPercent).toBe(95);
    expect(result.items[0].playerName).toBe("João");
    expect(result.items[1].progressPercent).toBe(88);
  });

  it("deve passar filtros corretos para o repositório", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1"],
      ["game-1", "game-2"],
    );
    const taskReportsRepo = createMockTaskReportsRepository();

    await getTaskBestPlayers(
      { organizationId: "org-1", leagueId: "league-1", sectorId: "sector-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(taskReportsRepo.getBestPlayers).toHaveBeenCalledWith({
      organizationId: "org-1",
      gameIds: ["game-1", "game-2"],
      sectorId: "sector-1",
    });
  });

  it("deve usar projectId do input quando fornecido", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([], ["game-1"]);
    const taskReportsRepo = createMockTaskReportsRepository();

    await getTaskBestPlayers(
      {
        organizationId: "org-1",
        leagueId: "league-1",
        projectId: "specific-proj",
      },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(leagueDataRepo.getProjectIds).not.toHaveBeenCalled();
    expect(leagueDataRepo.getGameIds).toHaveBeenCalledWith("org-1", [
      "specific-proj",
    ]);
  });
});
