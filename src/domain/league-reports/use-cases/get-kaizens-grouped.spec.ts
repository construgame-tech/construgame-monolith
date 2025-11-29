// Testes para os use cases de kaizens agrupados
// Verifica agrupamentos por projeto, tipo, setor, etc.

import { describe, expect, it, vi } from "vitest";

import type { IKaizenReportsRepository } from "../repositories/kaizen-reports.repository.interface";
import type { ILeagueDataRepository } from "../repositories/league-data.repository.interface";
import {
  getKaizensParticipantsPerProject,
  getKaizensPerBenefit,
  getKaizensPerPosition,
  getKaizensPerProject,
  getKaizensPerProjectPerParticipant,
  getKaizensPerSector,
  getKaizensPerType,
  getKaizensPerTypePerProject,
  getKaizensPerWeek,
  getMostReplicatedKaizens,
} from "./get-kaizens-grouped";

// Factory para criar mocks reutilizáveis
const createMockLeagueDataRepository = (
  projectIds: string[] = [],
): ILeagueDataRepository => ({
  findById: vi.fn(),
  getProjectIds: vi.fn().mockResolvedValue(projectIds),
  getGameIds: vi.fn().mockResolvedValue([]),
});

const createMockKaizenReportsRepository = (
  overrides: Partial<IKaizenReportsRepository> = {},
): IKaizenReportsRepository => ({
  getCounters: vi
    .fn()
    .mockResolvedValue({
      kaizenCount: 0,
      projectCount: 0,
      participantCount: 0,
    }),
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
  ...overrides,
});

describe("getKaizensPerProject", () => {
  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([]);
    const kaizenReportsRepo = createMockKaizenReportsRepository();

    const result = await getKaizensPerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toEqual([]);
    expect(kaizenReportsRepo.getKaizensPerProject).not.toHaveBeenCalled();
  });

  it("deve retornar kaizens agrupados por projeto", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1", "proj-2"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerProject: vi.fn().mockResolvedValue([
        { projectId: "proj-1", projectName: "Projeto 1", kaizenCount: 10 },
        { projectId: "proj-2", projectName: "Projeto 2", kaizenCount: 5 },
      ]),
    });

    const result = await getKaizensPerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].kaizenCount).toBe(10);
  });

  it("deve passar filtros corretos para o repositório", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository();

    await getKaizensPerProject(
      { organizationId: "org-1", leagueId: "league-1", sectorId: "sector-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(kaizenReportsRepo.getKaizensPerProject).toHaveBeenCalledWith({
      organizationId: "org-1",
      projectIds: ["proj-1"],
      sectorId: "sector-1",
    });
  });
});

describe("getKaizensPerTypePerProject", () => {
  it("deve retornar kaizens agrupados por tipo e projeto", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerTypePerProject: vi.fn().mockResolvedValue([
        {
          kaizenTypeId: "type-1",
          name: "Tipo 1",
          projects: [{ id: "proj-1", name: "Projeto 1", kaizenCount: 5 }],
        },
      ]),
    });

    const result = await getKaizensPerTypePerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].projects).toHaveLength(1);
  });
});

describe("getMostReplicatedKaizens", () => {
  it("deve retornar kaizens mais replicados", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getMostReplicatedKaizens: vi.fn().mockResolvedValue([
        {
          id: "kaizen-1",
          name: "Super Kaizen",
          photo: "photo.jpg",
          replicationCount: 15,
          kaizenTypeId: "type-1",
          benefits: [{ kpiId: "kpi-1", description: "Benefício" }],
        },
      ]),
    });

    const result = await getMostReplicatedKaizens(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].replicationCount).toBe(15);
  });
});

describe("getKaizensParticipantsPerProject", () => {
  it("deve retornar contagem de participantes por projeto", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1", "proj-2"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getParticipantsPerProject: vi.fn().mockResolvedValue([
        { projectId: "proj-1", projectName: "Projeto 1", participantCount: 10 },
        { projectId: "proj-2", projectName: "Projeto 2", participantCount: 5 },
      ]),
    });

    const result = await getKaizensParticipantsPerProject(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].participantCount).toBe(10);
  });
});

describe("getKaizensPerPosition", () => {
  it("deve retornar kaizens agrupados por cargo/posição", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerPosition: vi.fn().mockResolvedValue([
        { position: "Engenheiro", kaizenCount: 20 },
        { position: "Técnico", kaizenCount: 15 },
        { position: null, kaizenCount: 5 },
      ]),
    });

    const result = await getKaizensPerPosition(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(3);
    expect(result.items[0].position).toBe("Engenheiro");
    expect(result.items[2].position).toBeNull();
  });
});

describe("getKaizensPerSector", () => {
  it("deve retornar kaizens agrupados por setor", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerSector: vi.fn().mockResolvedValue([
        { sector: "Produção", kaizenCount: 30 },
        { sector: "Qualidade", kaizenCount: 20 },
      ]),
    });

    const result = await getKaizensPerSector(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
  });
});

describe("getKaizensPerType", () => {
  it("deve retornar kaizens agrupados por tipo", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerType: vi.fn().mockResolvedValue([
        { kaizenTypeId: "type-1", name: "Melhoria", kaizenCount: 25 },
        { kaizenTypeId: "type-2", name: "Inovação", kaizenCount: 10 },
      ]),
    });

    const result = await getKaizensPerType(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].name).toBe("Melhoria");
  });
});

describe("getKaizensPerBenefit", () => {
  it("deve retornar kaizens agrupados por benefício/KPI", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerBenefit: vi.fn().mockResolvedValue([
        { kpiId: "kpi-1", kaizenCount: 15 },
        { kpiId: "kpi-2", kaizenCount: 8 },
      ]),
    });

    const result = await getKaizensPerBenefit(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].kpiId).toBe("kpi-1");
  });
});

describe("getKaizensPerWeek", () => {
  it("deve retornar kaizens agrupados por semana", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerWeek: vi.fn().mockResolvedValue([
        { weekStart: "2025-01-06", weekEnd: "2025-01-12", kaizenCount: 10 },
        { weekStart: "2025-01-13", weekEnd: "2025-01-19", kaizenCount: 12 },
      ]),
    });

    const result = await getKaizensPerWeek(
      { organizationId: "org-1", leagueId: "league-1" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(result.items[0].weekStart).toBe("2025-01-06");
  });
});

describe("getKaizensPerProjectPerParticipant", () => {
  it("deve retornar kaizens de um participante por projeto", async () => {
    const leagueDataRepo = createMockLeagueDataRepository(["proj-1", "proj-2"]);
    const kaizenReportsRepo = createMockKaizenReportsRepository({
      getKaizensPerProjectPerParticipant: vi.fn().mockResolvedValue([
        { projectId: "proj-1", projectName: "Projeto 1", kaizenCount: 5 },
        { projectId: "proj-2", projectName: "Projeto 2", kaizenCount: 3 },
      ]),
    });

    const result = await getKaizensPerProjectPerParticipant(
      { organizationId: "org-1", leagueId: "league-1", userId: "user-123" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toHaveLength(2);
    expect(
      kaizenReportsRepo.getKaizensPerProjectPerParticipant,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1" }),
      "user-123",
    );
  });

  it("deve retornar array vazio quando não há projetos", async () => {
    const leagueDataRepo = createMockLeagueDataRepository([]);
    const kaizenReportsRepo = createMockKaizenReportsRepository();

    const result = await getKaizensPerProjectPerParticipant(
      { organizationId: "org-1", leagueId: "league-1", userId: "user-123" },
      leagueDataRepo,
      kaizenReportsRepo,
    );

    expect(result.items).toEqual([]);
  });
});
