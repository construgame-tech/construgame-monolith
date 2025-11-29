// Testes para o use case getTaskCounters
// Verifica cálculo de métricas de tasks

import { describe, expect, it, vi } from "vitest";

import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import type { ITaskReportsRepository } from "../repositories/task-reports.repository.interface";
import { getTaskCounters } from "./get-task-counters";

describe("getTaskCounters", () => {
  const createMockLeagueDataRepository = (
    projectIds: string[] = [],
    gameIds: string[] = [],
  ): ILeagueDataRepository => ({
    findById: vi.fn(),
    getProjectIds: vi.fn().mockResolvedValue(projectIds),
    getGameIds: vi.fn().mockResolvedValue(gameIds),
  });

  const createMockTaskReportsRepository = (
    data = {
      playerTaskCount: 0,
      teamTaskCount: 0,
      distinctPlayerCount: 0,
      distinctTeamCount: 0,
    },
  ): ITaskReportsRepository => ({
    getCounters: vi.fn().mockResolvedValue(data),
    getPerformancePerProject: vi.fn().mockResolvedValue([]),
    getPerformancePerGame: vi.fn().mockResolvedValue([]),
    getBestPlayers: vi.fn().mockResolvedValue([]),
  });

  it("deve retornar contadores zerados quando não há projetos na liga", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([], []);
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.counters).toEqual({
      projectCount: 0,
      taskPlayers: 0,
      taskTeams: 0,
      participantPlayers: 0,
      participantTeams: 0,
    });
    expect(taskReportsRepo.getCounters).not.toHaveBeenCalled();
  });

  it("deve retornar projectCount mesmo quando não há games", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1", "proj-2"],
      [],
    );
    const taskReportsRepo = createMockTaskReportsRepository();

    const result = await getTaskCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.counters.projectCount).toBe(2);
    expect(result.counters.taskPlayers).toBe(0);
    expect(taskReportsRepo.getCounters).not.toHaveBeenCalled();
  });

  it("deve retornar contadores corretos quando há games e tasks", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1", "proj-2"],
      ["game-1", "game-2"],
    );
    const taskReportsRepo = createMockTaskReportsRepository({
      playerTaskCount: 115,
      teamTaskCount: 10,
      distinctPlayerCount: 4,
      distinctTeamCount: 2,
    });

    const result = await getTaskCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(result.counters).toEqual({
      projectCount: 2,
      taskPlayers: 115,
      taskTeams: 10,
      participantPlayers: 4,
      participantTeams: 2,
    });
  });

  it("deve usar projectId do input quando fornecido", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([], ["game-1"]);
    const taskReportsRepo = createMockTaskReportsRepository({
      playerTaskCount: 50,
      teamTaskCount: 0,
      distinctPlayerCount: 3,
      distinctTeamCount: 0,
    });

    const result = await getTaskCounters(
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
    expect(result.counters.projectCount).toBe(1);
  });

  it("deve buscar gameIds com os projectIds corretos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1", "proj-2", "proj-3"],
      ["game-1"],
    );
    const taskReportsRepo = createMockTaskReportsRepository();

    await getTaskCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(leagueDataRepo.getGameIds).toHaveBeenCalledWith("org-1", [
      "proj-1",
      "proj-2",
      "proj-3",
    ]);
  });

  it("deve passar gameIds e sectorId para o repositório de tasks", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(
      ["proj-1"],
      ["game-1", "game-2"],
    );
    const taskReportsRepo = createMockTaskReportsRepository();

    await getTaskCounters(
      { organizationId: "org-1", leagueId: "league-1", sectorId: "sector-1" },
      leagueDataRepo,
      taskReportsRepo,
    );

    expect(taskReportsRepo.getCounters).toHaveBeenCalledWith({
      organizationId: "org-1",
      gameIds: ["game-1", "game-2"],
      sectorId: "sector-1",
    });
  });
});
