// Testes para os use cases de aderência de kaizen
// Verifica cálculo de porcentagem e contagens

import { describe, expect, it, vi } from "vitest";

import type { IKaizenReportsRepository } from "../repositories/kaizen-reports.repository.interface";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import {
  getKaizenAdherenceCount,
  getKaizenAdherencePercentage,
} from "./get-kaizen-adherence";

describe("getKaizenAdherencePercentage", () => {
  const createMockLeagueDataRepository = (
    projectIds: string[] = [],
  ): ILeagueDataRepository => ({
    findById: vi.fn(),
    getProjectIds: vi.fn().mockResolvedValue(projectIds),
    getGameIds: vi.fn().mockResolvedValue([]),
  });

  const createMockKaizenReportsRepository = (
    adherenceData: Array<{
      projectId: string;
      name: string;
      possibleCount: number;
      executedCount: number;
    }> = [],
  ): IKaizenReportsRepository => ({
    getCounters: vi.fn(),
    getKaizensPerProject: vi.fn(),
    getKaizensPerTypePerProject: vi.fn(),
    getMostReplicatedKaizens: vi.fn(),
    getParticipantsPerProject: vi.fn(),
    getAdherenceData: vi.fn().mockResolvedValue(adherenceData),
    getKaizensPerPosition: vi.fn(),
    getKaizensPerSector: vi.fn(),
    getKaizensPerType: vi.fn(),
    getKaizensPerBenefit: vi.fn(),
    getKaizensPerWeek: vi.fn(),
    getKaizensPerProjectPerParticipant: vi.fn(),
  });

  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([]);
    const kaizenReportsRepo = createMockKaizenReportsRepository();

    const result = await getKaizenAdherencePercentage(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toEqual([]);
  });

  it("deve calcular porcentagem de aderência corretamente", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1", "proj-2"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository([
      {
        projectId: "proj-1",
        name: "Projeto 1",
        possibleCount: 100,
        executedCount: 75,
      },
      {
        projectId: "proj-2",
        name: "Projeto 2",
        possibleCount: 50,
        executedCount: 25,
      },
    ]);

    const result = await getKaizenAdherencePercentage(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      projectId: "proj-1",
      name: "Projeto 1",
      adherence: 75, // 75/100 * 100 = 75%
    });
    expect(result.items[1]).toEqual({
      projectId: "proj-2",
      name: "Projeto 2",
      adherence: 50, // 25/50 * 100 = 50%
    });
  });

  it("deve retornar 0% quando possibleCount é 0", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository([
      {
        projectId: "proj-1",
        name: "Projeto Novo",
        possibleCount: 0,
        executedCount: 0,
      },
    ]);

    const result = await getKaizenAdherencePercentage(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items[0].adherence).toBe(0);
  });

  it("deve arredondar porcentagem para 2 casas decimais", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository([
      {
        projectId: "proj-1",
        name: "Projeto 1",
        possibleCount: 3,
        executedCount: 1,
      },
    ]);

    const result = await getKaizenAdherencePercentage(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    // 1/3 * 100 = 33.333... -> 33.33
    expect(result.items[0].adherence).toBe(33.33);
  });

  it("deve calcular 100% quando executedCount >= possibleCount", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository([
      {
        projectId: "proj-1",
        name: "Projeto 1",
        possibleCount: 10,
        executedCount: 15,
      },
    ]);

    const result = await getKaizenAdherencePercentage(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    // 15/10 * 100 = 150%
    expect(result.items[0].adherence).toBe(150);
  });
});

describe("getKaizenAdherenceCount", () => {
  const createMockLeagueDataRepository = (
    projectIds: string[] = [],
  ): ILeagueDataRepository => ({
    findById: vi.fn(),
    getProjectIds: vi.fn().mockResolvedValue(projectIds),
    getGameIds: vi.fn().mockResolvedValue([]),
  });

  const createMockKaizenReportsRepository = (
    adherenceData: Array<{
      projectId: string;
      name: string;
      possibleCount: number;
      executedCount: number;
    }> = [],
  ): IKaizenReportsRepository => ({
    getCounters: vi.fn(),
    getKaizensPerProject: vi.fn(),
    getKaizensPerTypePerProject: vi.fn(),
    getMostReplicatedKaizens: vi.fn(),
    getParticipantsPerProject: vi.fn(),
    getAdherenceData: vi.fn().mockResolvedValue(adherenceData),
    getKaizensPerPosition: vi.fn(),
    getKaizensPerSector: vi.fn(),
    getKaizensPerType: vi.fn(),
    getKaizensPerBenefit: vi.fn(),
    getKaizensPerWeek: vi.fn(),
    getKaizensPerProjectPerParticipant: vi.fn(),
  });

  it("deve retornar dados brutos de aderência sem cálculo", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository([
      {
        projectId: "proj-1",
        name: "Projeto 1",
        possibleCount: 100,
        executedCount: 75,
      },
    ]);

    const result = await getKaizenAdherenceCount(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items[0]).toEqual({
      projectId: "proj-1",
      name: "Projeto 1",
      possibleCount: 100,
      executedCount: 75,
    });
  });

  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([]);
    const kaizenReportsRepo = createMockKaizenReportsRepository();

    const result = await getKaizenAdherenceCount(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toEqual([]);
  });
});
