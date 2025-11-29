// Testes para o use case getKaizenCounters
// Verifica cálculo de métricas de kaizen

import { describe, expect, it, vi } from "vitest";

import type { IKaizenReportsRepository } from "../repositories/kaizen-reports.repository.interface";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import { getKaizenCounters } from "./get-kaizen-counters";

describe("getKaizenCounters", () => {
  const createMockLeagueDataRepository = (
    projectIds: string[] = [],
  ): ILeagueDataRepository => ({
    findById: vi.fn(),
    getProjectIds: vi.fn().mockResolvedValue(projectIds),
    getGameIds: vi.fn().mockResolvedValue([]),
  });

  const createMockKaizenReportsRepository = (
    data = { kaizenCount: 0, projectCount: 0, participantCount: 0 },
  ): IKaizenReportsRepository => ({
    getCounters: vi.fn().mockResolvedValue(data),
    getKaizensPerProject: vi.fn().mockResolvedValue([]),
    getKaizensPerTypePerProject: vi.fn().mockResolvedValue([]),
    getMostReplicatedKaizens: vi.fn().mockResolvedValue([]),
    getParticipantsPerProject: vi.fn().mockResolvedValue([]),
    getAdherenceData: vi.fn().mockResolvedValue([]),
    getKaizensPerPosition: vi.fn().mockResolvedValue([]),
    getKaizensPerSector: vi.fn().mockResolvedValue([]),
    getKaizensPerType: vi.fn().mockResolvedValue([]),
    getKaizensPerBenefit: vi.fn().mockResolvedValue([]),
    getKaizensPerWeek: vi.fn().mockResolvedValue([]),
    getKaizensPerProjectPerParticipant: vi.fn().mockResolvedValue([]),
  });

  it("deve retornar contadores zerados quando não há projetos na liga", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([]);
    const kaizenReportsRepo = createMockKaizenReportsRepository();

    const result = await getKaizenCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.counters).toEqual({
      kaizenCount: 0,
      projectCount: 0,
      kaizensPerProject: 0,
      kaizensPerParticipant: 0,
      kaizensPlayers: 0,
    });
    expect(kaizenReportsRepo.getCounters).not.toHaveBeenCalled();
  });

  it("deve calcular kaizensPerProject corretamente", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1", "proj-2"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      kaizenCount: 10,
      projectCount: 2,
      participantCount: 5,
    });

    const result = await getKaizenCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    // 10 kaizens / 2 projetos = 5
    expect(result.counters.kaizensPerProject).toBe(5);
  });

  it("deve calcular kaizensPerParticipant corretamente", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      kaizenCount: 15,
      projectCount: 1,
      participantCount: 3,
    });

    const result = await getKaizenCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    // 15 kaizens / 3 participantes = 5
    expect(result.counters.kaizensPerParticipant).toBe(5);
  });

  it("deve retornar 0 para kaizensPerProject quando projectCount é 0", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      kaizenCount: 0,
      projectCount: 0,
      participantCount: 0,
    });

    const result = await getKaizenCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.counters.kaizensPerProject).toBe(0);
    expect(result.counters.kaizensPerParticipant).toBe(0);
  });

  it("deve usar projectId do input quando fornecido", async () => {
    const leagueDataRepo = createMockLeagueDataRepository();
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      kaizenCount: 5,
      projectCount: 1,
      participantCount: 2,
    });

    await getKaizenCounters(
      {
        organizationId: "org-1",
        leagueId: "league-1",
        projectId: "specific-proj",
      },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    // Não deve chamar getProjectIds quando projectId é fornecido
    expect(leagueDataRepo.getProjectIds).not.toHaveBeenCalled();
    expect(kaizenReportsRepo.getCounters).toHaveBeenCalledWith({
      organizationId: "org-1",
      projectIds: ["specific-proj"],
      sectorId: undefined,
    });
  });

  it("deve passar sectorId para o repositório quando fornecido", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      kaizenCount: 5,
      projectCount: 1,
      participantCount: 2,
    });

    await getKaizenCounters(
      { organizationId: "org-1", leagueId: "league-1", sectorId: "sector-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(kaizenReportsRepo.getCounters).toHaveBeenCalledWith({
      organizationId: "org-1",
      projectIds: ["proj-1"],
      sectorId: "sector-1",
    });
  });

  it("deve arredondar valores decimais para 2 casas", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([
      "proj-1",
      "proj-2",
      "proj-3",
    ]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      kaizenCount: 10,
      projectCount: 3,
      participantCount: 7,
    });

    const result = await getKaizenCounters(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    // 10 / 3 = 3.333... -> 3.33
    expect(result.counters.kaizensPerProject).toBe(3.33);
    // 10 / 7 = 1.428... -> 1.43
    expect(result.counters.kaizensPerParticipant).toBe(1.43);
  });
});
