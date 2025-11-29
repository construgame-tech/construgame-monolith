import type { DrizzleDB } from "@infrastructure/database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "@infrastructure/database/drizzle.provider";
import { games } from "@infrastructure/database/schemas/game.schema";
import { kaizens } from "@infrastructure/database/schemas/kaizen.schema";
import { kaizenTypes } from "@infrastructure/database/schemas/kaizen-type.schema";
import { leagues } from "@infrastructure/database/schemas/league.schema";
import { members } from "@infrastructure/database/schemas/member.schema";
import { projects } from "@infrastructure/database/schemas/project.schema";
import { tasks } from "@infrastructure/database/schemas/task.schema";
import { teams } from "@infrastructure/database/schemas/team.schema";
import { users } from "@infrastructure/database/schemas/user.schema";
import { Inject, Injectable } from "@nestjs/common";
import { and, count, countDistinct, eq, inArray, sql, sum } from "drizzle-orm";

// Response DTOs
export interface KaizenCountersResponse {
  kaizenCount: number;
  projectCount: number;
  kaizensPerProject: number;
  kaizensPerParticipant: number;
  kaizensPlayers: number;
}

export interface KaizensPerProjectItem {
  projectId: string;
  projectName: string;
  kaizenCount: number;
}

export interface KaizensPerTypePerProjectItem {
  kaizenTypeId: string;
  name: string;
  projects: {
    id: string;
    name: string;
    kaizenCount: number;
  }[];
}

export interface MostReplicatedKaizenItem {
  id: string;
  name: string;
  photo?: string;
  replicationCount: number;
  kaizenTypeId?: string;
  benefits: { kpiId: string; description?: string }[];
}

export interface KaizensParticipantsPerProjectItem {
  projectId: string;
  projectName: string;
  participantCount: number;
}

export interface KaizensAdherencePercentageItem {
  projectId: string;
  name: string;
  adherence: number;
}

export interface KaizensAdherenceCountItem {
  projectId: string;
  name: string;
  possibleCount: number;
  executedCount: number;
}

export interface KaizensPerPositionItem {
  position: string | null;
  kaizenCount: number;
}

export interface KaizensPerSectorItem {
  sector: string | null;
  kaizenCount: number;
}

export interface KaizensPerTypeItem {
  kaizenTypeId: string;
  name: string;
  kaizenCount: number;
}

export interface KaizensPerBenefitItem {
  kpiId: string;
  kaizenCount: number;
}

export interface KaizensPerWeekItem {
  weekStart: string;
  weekEnd: string;
  kaizenCount: number;
}

export interface KaizensPerProjectPerParticipantItem {
  projectId: string;
  projectName: string;
  kaizenCount: number;
}

@Injectable()
export class LeagueReportsService {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Obtém os IDs de projetos associados a uma liga
   */
  private async getLeagueProjectIds(
    organizationId: string,
    leagueId: string,
  ): Promise<string[]> {
    const league = await this.db
      .select({ projects: leagues.projects, gameId: leagues.gameId })
      .from(leagues)
      .where(eq(leagues.id, leagueId))
      .limit(1);

    if (!league[0]) return [];

    // Se a liga tem projetos definidos, usa eles
    if (league[0].projects && league[0].projects.length > 0) {
      return league[0].projects;
    }

    // Caso contrário, busca projetos da organização que têm o gameId da liga
    if (league[0].gameId) {
      const projectsWithGame = await this.db
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.organizationId, organizationId),
            eq(projects.activeGameId, league[0].gameId),
          ),
        );
      return projectsWithGame.map((p) => p.id);
    }

    return [];
  }

  /**
   * GET /reports/kaizen-counters
   * Contadores gerais de kaizen
   */
  async getKaizenCounters(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<KaizenCountersResponse> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return {
        kaizenCount: 0,
        projectCount: 0,
        kaizensPerProject: 0,
        kaizensPerParticipant: 0,
        kaizensPlayers: 0,
      };
    }

    // Conta kaizens nos projetos da liga
    const kaizenCountResult = await this.db
      .select({ count: count() })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      );

    const kaizenCount = kaizenCountResult[0]?.count || 0;

    // Conta projetos únicos com kaizens
    const projectCountResult = await this.db
      .select({ count: countDistinct(kaizens.projectId) })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      );

    const projectCount = projectCountResult[0]?.count || 0;

    // Conta participantes únicos (autores de kaizen)
    const playersResult = await this.db
      .select({ count: countDistinct(kaizens.authorId) })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      );

    const kaizensPlayers = playersResult[0]?.count || 0;

    const kaizensPerProject = projectCount > 0 ? kaizenCount / projectCount : 0;
    const kaizensPerParticipant =
      kaizensPlayers > 0 ? kaizenCount / kaizensPlayers : 0;

    return {
      kaizenCount,
      projectCount,
      kaizensPerProject,
      kaizensPerParticipant,
      kaizensPlayers,
    };
  }

  /**
   * GET /reports/kaizens-per-project
   * Kaizens por projeto
   */
  async getKaizensPerProject(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerProjectItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca contagem de kaizens por projeto
    const result = await this.db
      .select({
        projectId: kaizens.projectId,
        kaizenCount: count(),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.projectId);

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const projectNameMap = new Map(projectNames.map((p) => [p.id, p.name]));

    const items = result.map((r) => ({
      projectId: r.projectId,
      projectName: projectNameMap.get(r.projectId) || "",
      kaizenCount: r.kaizenCount,
    }));

    // Ordena por contagem decrescente
    items.sort((a, b) => b.kaizenCount - a.kaizenCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-per-type-per-project
   * Kaizens por tipo, agrupados por projeto
   */
  async getKaizensPerTypePerProject(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerTypePerProjectItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca contagem de kaizens por tipo e projeto
    const result = await this.db
      .select({
        kaizenTypeId: kaizens.kaizenTypeId,
        projectId: kaizens.projectId,
        kaizenCount: count(),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.kaizenTypeId, kaizens.projectId);

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const projectNameMap = new Map(projectNames.map((p) => [p.id, p.name]));

    // Busca nomes dos tipos de kaizen
    const uniqueTypeIds = [
      ...new Set(result.map((r) => r.kaizenTypeId).filter(Boolean)),
    ] as string[];

    let typeNameMap = new Map<string, string>();
    if (uniqueTypeIds.length > 0) {
      const typeNames = await this.db
        .select({ id: kaizenTypes.id, name: kaizenTypes.name })
        .from(kaizenTypes)
        .where(inArray(kaizenTypes.id, uniqueTypeIds));

      typeNameMap = new Map(typeNames.map((t) => [t.id, t.name]));
    }

    // Agrupa por tipo
    const typeMap = new Map<
      string,
      { name: string; projects: Map<string, { name: string; count: number }> }
    >();

    for (const r of result) {
      const typeId = r.kaizenTypeId || "unknown";
      if (!typeMap.has(typeId)) {
        typeMap.set(typeId, {
          name: typeNameMap.get(typeId) || "Sem tipo",
          projects: new Map(),
        });
      }

      const typeData = typeMap.get(typeId)!;
      typeData.projects.set(r.projectId, {
        name: projectNameMap.get(r.projectId) || "",
        count: r.kaizenCount,
      });
    }

    // Adiciona projetos com 0 kaizens para cada tipo
    const items: KaizensPerTypePerProjectItem[] = [];
    for (const [typeId, typeData] of typeMap) {
      const projectsArray = projectIds.map((pid) => ({
        id: pid,
        name: projectNameMap.get(pid) || "",
        kaizenCount: typeData.projects.get(pid)?.count || 0,
      }));

      // Ordena projetos por contagem decrescente
      projectsArray.sort((a, b) => b.kaizenCount - a.kaizenCount);

      items.push({
        kaizenTypeId: typeId,
        name: typeData.name,
        projects: projectsArray,
      });
    }

    return { items };
  }

  /**
   * GET /reports/most-replicated-kaizens
   * Kaizens mais replicados
   */
  async getMostReplicatedKaizens(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
    isReplica?: boolean,
    category?: string,
  ): Promise<{ items: MostReplicatedKaizenItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca kaizens originais (que têm replicas)
    const allKaizens = await this.db
      .select({
        id: kaizens.id,
        name: kaizens.name,
        currentSituationImages: kaizens.currentSituationImages,
        kaizenTypeId: kaizens.kaizenTypeId,
        benefits: kaizens.benefits,
        replicas: kaizens.replicas,
        originalKaizenId: kaizens.originalKaizenId,
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      );

    // Conta replicações para cada kaizen original
    const replicationCount = new Map<string, number>();

    for (const k of allKaizens) {
      // Conta pelo campo replicas (array de IDs de réplicas)
      if (k.replicas && k.replicas.length > 0) {
        replicationCount.set(
          k.id,
          (replicationCount.get(k.id) || 0) + k.replicas.length,
        );
      }

      // Também conta kaizens que são réplicas de outros
      if (k.originalKaizenId) {
        replicationCount.set(
          k.originalKaizenId,
          (replicationCount.get(k.originalKaizenId) || 0) + 1,
        );
      }
    }

    // Filtra kaizens que foram replicados
    const replicatedKaizens = allKaizens.filter(
      (k) => (replicationCount.get(k.id) || 0) > 0,
    );

    // Monta resposta
    const items: MostReplicatedKaizenItem[] = replicatedKaizens
      .map((k) => ({
        id: k.id,
        name: k.name,
        photo: k.currentSituationImages?.[0],
        replicationCount: replicationCount.get(k.id) || 0,
        kaizenTypeId: k.kaizenTypeId || undefined,
        benefits: k.benefits || [],
      }))
      .sort((a, b) => b.replicationCount - a.replicationCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-participants-per-project
   * Participantes de kaizen por projeto
   */
  async getKaizensParticipantsPerProject(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensParticipantsPerProjectItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Conta autores distintos por projeto
    const result = await this.db
      .select({
        projectId: kaizens.projectId,
        participantCount: countDistinct(kaizens.authorId),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.projectId);

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const projectNameMap = new Map(projectNames.map((p) => [p.id, p.name]));

    const items = result.map((r) => ({
      projectId: r.projectId,
      projectName: projectNameMap.get(r.projectId) || "",
      participantCount: r.participantCount,
    }));

    // Ordena por contagem decrescente
    items.sort((a, b) => b.participantCount - a.participantCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-adherence-percentage
   * Percentual de adesão de kaizen por projeto
   * Adesão = (participantes que fizeram kaizen / total de membros do projeto) * 100
   */
  async getKaizensAdherencePercentage(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensAdherencePercentageItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca total de membros da organização (players)
    const totalMembersResult = await this.db
      .select({ count: count() })
      .from(members)
      .where(
        and(
          eq(members.organizationId, organizationId),
          eq(members.role, "player"),
        ),
      );

    const totalMembers = totalMembersResult[0]?.count || 0;

    if (totalMembers === 0) {
      // Retorna 0% de adesão se não há membros
      const projectNames = await this.db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(inArray(projects.id, projectIds));

      return {
        items: projectNames.map((p) => ({
          projectId: p.id,
          name: p.name,
          adherence: 0,
        })),
      };
    }

    // Conta autores distintos por projeto
    const participantsResult = await this.db
      .select({
        projectId: kaizens.projectId,
        participantCount: countDistinct(kaizens.authorId),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.projectId);

    const participantMap = new Map(
      participantsResult.map((r) => [r.projectId, r.participantCount]),
    );

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const items = projectNames.map((p) => {
      const participants = participantMap.get(p.id) || 0;
      const adherence = (participants / totalMembers) * 100;

      return {
        projectId: p.id,
        name: p.name,
        adherence,
      };
    });

    // Ordena por adesão decrescente
    items.sort((a, b) => b.adherence - a.adherence);

    return { items };
  }

  /**
   * GET /reports/kaizens-adherence-percentage
   * Percentual de adesão de kaizen por projeto com filtro opcional por tipo de kaizen
   * Calcula a porcentagem de kaizens executados vs possíveis por projeto
   */
  async getKaizensAdherencePercentageWithFilter(
    organizationId: string,
    leagueId: string,
    kaizenTypeId?: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensAdherencePercentageItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca o total de membros por projeto (players)
    const membersPerProjectResult = await this.db
      .select({
        count: count(),
      })
      .from(members)
      .where(
        and(
          eq(members.organizationId, organizationId),
          eq(members.role, "player"),
        ),
      );

    const totalMembers = membersPerProjectResult[0]?.count || 0;

    if (totalMembers === 0) {
      const projectNames = await this.db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(inArray(projects.id, projectIds));

      return {
        items: projectNames.map((p) => ({
          projectId: p.id,
          name: p.name,
          adherence: 0,
        })),
      };
    }

    // Constrói condição para kaizens
    const kaizenConditions = [
      eq(kaizens.organizationId, organizationId),
      inArray(kaizens.projectId, projectIds),
    ];

    if (kaizenTypeId) {
      kaizenConditions.push(eq(kaizens.kaizenTypeId, kaizenTypeId));
    }

    // Conta autores distintos por projeto que fizeram kaizen (do tipo especificado)
    const participantsResult = await this.db
      .select({
        projectId: kaizens.projectId,
        participantCount: countDistinct(kaizens.authorId),
      })
      .from(kaizens)
      .where(and(...kaizenConditions))
      .groupBy(kaizens.projectId);

    const participantMap = new Map(
      participantsResult.map((r) => [r.projectId, r.participantCount]),
    );

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const items = projectNames.map((p) => {
      const participants = participantMap.get(p.id) || 0;
      const adherence = (participants / totalMembers) * 100;

      return {
        projectId: p.id,
        name: p.name,
        adherence,
      };
    });

    // Ordena por adesão decrescente
    items.sort((a, b) => b.adherence - a.adherence);

    return { items };
  }

  /**
   * GET /reports/kaizens-adherence-count
   * Contagem de kaizens possíveis vs executados por projeto
   */
  async getKaizensAdherenceCount(
    organizationId: string,
    leagueId: string,
    kaizenTypeId?: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensAdherenceCountItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca o total de membros (players) da organização - representa "possíveis" por projeto
    const totalMembersResult = await this.db
      .select({ count: count() })
      .from(members)
      .where(
        and(
          eq(members.organizationId, organizationId),
          eq(members.role, "player"),
        ),
      );

    const totalMembers = totalMembersResult[0]?.count || 0;

    // Constrói condição para kaizens
    const kaizenConditions = [
      eq(kaizens.organizationId, organizationId),
      inArray(kaizens.projectId, projectIds),
    ];

    if (kaizenTypeId) {
      kaizenConditions.push(eq(kaizens.kaizenTypeId, kaizenTypeId));
    }

    // Conta kaizens executados por projeto
    const executedResult = await this.db
      .select({
        projectId: kaizens.projectId,
        executedCount: countDistinct(kaizens.authorId),
      })
      .from(kaizens)
      .where(and(...kaizenConditions))
      .groupBy(kaizens.projectId);

    const executedMap = new Map(
      executedResult.map((r) => [r.projectId, r.executedCount]),
    );

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const items = projectNames.map((p) => ({
      projectId: p.id,
      name: p.name,
      possibleCount: totalMembers,
      executedCount: executedMap.get(p.id) || 0,
    }));

    return { items };
  }

  /**
   * GET /reports/kaizens-per-position
   * Kaizens agrupados por cargo (position) do autor
   */
  async getKaizensPerPosition(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerPositionItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Conta kaizens por position do membro (author)
    const result = await this.db
      .select({
        position: members.position,
        kaizenCount: count(),
      })
      .from(kaizens)
      .innerJoin(
        members,
        and(
          sql`${kaizens.authorId}::uuid = ${members.userId}`,
          eq(members.organizationId, organizationId),
        ),
      )
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(members.position);

    const items = result.map((r) => ({
      position: r.position,
      kaizenCount: r.kaizenCount,
    }));

    // Ordena por contagem decrescente
    items.sort((a, b) => b.kaizenCount - a.kaizenCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-per-sector
   * Kaizens agrupados por setor do autor
   */
  async getKaizensPerSector(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerSectorItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Conta kaizens por setor do membro (author)
    const result = await this.db
      .select({
        sector: members.sector,
        kaizenCount: count(),
      })
      .from(kaizens)
      .innerJoin(
        members,
        and(
          sql`${kaizens.authorId}::uuid = ${members.userId}`,
          eq(members.organizationId, organizationId),
        ),
      )
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(members.sector);

    const items = result.map((r) => ({
      sector: r.sector,
      kaizenCount: r.kaizenCount,
    }));

    // Ordena por contagem decrescente
    items.sort((a, b) => b.kaizenCount - a.kaizenCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-per-type
   * Kaizens agrupados por tipo
   */
  async getKaizensPerType(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerTypeItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Conta kaizens por tipo
    const result = await this.db
      .select({
        kaizenTypeId: kaizens.kaizenTypeId,
        kaizenCount: count(),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.kaizenTypeId);

    // Busca nomes dos tipos
    const typeIds = result
      .map((r) => r.kaizenTypeId)
      .filter(Boolean) as string[];
    const types =
      typeIds.length > 0
        ? await this.db
            .select({ id: kaizenTypes.id, name: kaizenTypes.name })
            .from(kaizenTypes)
            .where(inArray(kaizenTypes.id, typeIds))
        : [];

    const typeNameMap = new Map(types.map((t) => [t.id, t.name]));

    const items = result
      .filter((r) => r.kaizenTypeId)
      .map((r) => ({
        kaizenTypeId: r.kaizenTypeId as string,
        name: typeNameMap.get(r.kaizenTypeId as string) || "Desconhecido",
        kaizenCount: r.kaizenCount,
      }));

    // Ordena por contagem decrescente
    items.sort((a, b) => b.kaizenCount - a.kaizenCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-per-benefit
   * Kaizens agrupados por benefício (kpiId)
   */
  async getKaizensPerBenefit(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerBenefitItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Busca todos os kaizens com benefits
    const kaizensWithBenefits = await this.db
      .select({
        id: kaizens.id,
        benefits: kaizens.benefits,
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      );

    // Conta por kpiId (benefits é um array de { kpiId, description? })
    const kpiCountMap = new Map<string, number>();
    for (const k of kaizensWithBenefits) {
      const benefits = k.benefits as
        | { kpiId: string; description?: string }[]
        | null;
      if (benefits && Array.isArray(benefits)) {
        for (const benefit of benefits) {
          if (benefit.kpiId) {
            kpiCountMap.set(
              benefit.kpiId,
              (kpiCountMap.get(benefit.kpiId) || 0) + 1,
            );
          }
        }
      }
    }

    const items: KaizensPerBenefitItem[] = Array.from(
      kpiCountMap.entries(),
    ).map(([kpiId, kaizenCount]) => ({
      kpiId,
      kaizenCount,
    }));

    // Ordena por contagem decrescente
    items.sort((a, b) => b.kaizenCount - a.kaizenCount);

    return { items };
  }

  /**
   * GET /reports/kaizens-per-week
   * Kaizens agrupados por semana
   */
  async getKaizensPerWeek(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerWeekItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Agrupa kaizens por semana usando DATE_TRUNC
    const result = await this.db
      .select({
        weekStart: sql<string>`DATE_TRUNC('week', ${kaizens.createdDate})::date`,
        kaizenCount: count(),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(sql`DATE_TRUNC('week', ${kaizens.createdDate})`)
      .orderBy(sql`DATE_TRUNC('week', ${kaizens.createdDate})`);

    const items: KaizensPerWeekItem[] = result.map((r) => {
      const weekStartDate = new Date(r.weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      return {
        weekStart: weekStartDate.toISOString().split("T")[0],
        weekEnd: weekEndDate.toISOString().split("T")[0],
        kaizenCount: r.kaizenCount,
      };
    });

    return { items };
  }

  /**
   * GET /reports/kaizens-per-project-per-participant
   * Média de kaizens por participante por projeto
   */
  async getKaizensPerProjectPerParticipant(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{ items: KaizensPerProjectPerParticipantItem[] }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return { items: [] };
    }

    // Para cada projeto, calcula kaizens / participantes
    const kaizenCountResult = await this.db
      .select({
        projectId: kaizens.projectId,
        kaizenCount: count(),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.projectId);

    const participantCountResult = await this.db
      .select({
        projectId: kaizens.projectId,
        participantCount: countDistinct(kaizens.authorId),
      })
      .from(kaizens)
      .where(
        and(
          eq(kaizens.organizationId, organizationId),
          inArray(kaizens.projectId, projectIds),
        ),
      )
      .groupBy(kaizens.projectId);

    const kaizenMap = new Map(
      kaizenCountResult.map((r) => [r.projectId, r.kaizenCount]),
    );
    const participantMap = new Map(
      participantCountResult.map((r) => [r.projectId, r.participantCount]),
    );

    // Busca nomes dos projetos
    const projectNames = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const items: KaizensPerProjectPerParticipantItem[] = projectNames.map(
      (p) => {
        const kaizenCount = kaizenMap.get(p.id) || 0;
        const participantCount = participantMap.get(p.id) || 1; // Evita divisão por zero
        return {
          projectId: p.id,
          projectName: p.name,
          kaizenCount: kaizenCount / participantCount,
        };
      },
    );

    // Ordena por contagem decrescente
    items.sort((a, b) => b.kaizenCount - a.kaizenCount);

    return { items };
  }

  // =====================================
  // TASK REPORTS
  // =====================================

  /**
   * GET /reports/task-counters
   * Contadores de tasks da liga
   * Formato: { projectCount, taskPlayers, taskTeams, participantPlayers, participantTeams }
   */
  async getTaskCounters(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<{
    projectCount: number;
    taskPlayers: number;
    taskTeams: number;
    participantPlayers: number;
    participantTeams: number;
  }> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return {
        projectCount: 0,
        taskPlayers: 0,
        taskTeams: 0,
        participantPlayers: 0,
        participantTeams: 0,
      };
    }

    // Busca games dos projetos
    const gamesResult = await this.db
      .select({ id: games.id })
      .from(games)
      .where(
        and(
          eq(games.organizationId, organizationId),
          inArray(games.projectId, projectIds),
        ),
      );

    const gameIds = gamesResult.map((g) => g.id);

    if (gameIds.length === 0) {
      return {
        projectCount: projectIds.length,
        taskPlayers: 0,
        taskTeams: 0,
        participantPlayers: 0,
        participantTeams: 0,
      };
    }

    // Conta tasks por player (userId not null)
    const playerTasksResult = await this.db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(inArray(tasks.gameId, gameIds), sql`${tasks.userId} IS NOT NULL`),
      );
    const taskPlayers = playerTasksResult[0]?.count || 0;

    // Conta tasks por team (teamId not null and userId is null)
    const teamTasksResult = await this.db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(
          inArray(tasks.gameId, gameIds),
          sql`${tasks.teamId} IS NOT NULL`,
          sql`${tasks.userId} IS NULL`,
        ),
      );
    const taskTeams = teamTasksResult[0]?.count || 0;

    // Conta participantes distintos (players com tasks)
    const participantPlayersResult = await this.db
      .select({ count: countDistinct(tasks.userId) })
      .from(tasks)
      .where(
        and(inArray(tasks.gameId, gameIds), sql`${tasks.userId} IS NOT NULL`),
      );
    const participantPlayers = participantPlayersResult[0]?.count || 0;

    // Conta teams distintos com tasks
    const participantTeamsResult = await this.db
      .select({ count: countDistinct(tasks.teamId) })
      .from(tasks)
      .where(
        and(inArray(tasks.gameId, gameIds), sql`${tasks.teamId} IS NOT NULL`),
      );
    const participantTeams = participantTeamsResult[0]?.count || 0;

    return {
      projectCount: projectIds.length,
      taskPlayers,
      taskTeams,
      participantPlayers,
      participantTeams,
    };
  }

  /**
   * GET /reports/task-performance-per-project
   * Performance de tasks por projeto agrupado por KPI
   * Formato: [{ projectName, [kpiId1]: %, [kpiId2]: %, ... }]
   */
  async getTaskPerformancePerProject(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<Record<string, string | number>[]> {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return [];
    }

    // Busca games dos projetos com seus nomes
    const gamesResult = await this.db
      .select({
        id: games.id,
        projectId: games.projectId,
      })
      .from(games)
      .where(
        and(
          eq(games.organizationId, organizationId),
          inArray(games.projectId, projectIds),
        ),
      );

    if (gamesResult.length === 0) {
      return [];
    }

    const gameIds = gamesResult.map((g) => g.id);
    const gameProjectMap = new Map(gamesResult.map((g) => [g.id, g.projectId]));

    // Busca nomes dos projetos
    const projectsResult = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const projectNameMap = new Map(projectsResult.map((p) => [p.id, p.name]));

    // Busca todas as tasks dos games
    const tasksResult = await this.db
      .select({
        gameId: tasks.gameId,
        kpiId: tasks.kpiId,
        progress: tasks.progress,
      })
      .from(tasks)
      .where(inArray(tasks.gameId, gameIds));

    // Agrupa por projeto e KPI, calculando média de progresso
    const projectKpiProgress = new Map<
      string,
      Map<string, { total: number; count: number }>
    >();

    for (const task of tasksResult) {
      const projectIdForTask = gameProjectMap.get(task.gameId);
      if (!projectIdForTask) continue;

      if (!projectKpiProgress.has(projectIdForTask)) {
        projectKpiProgress.set(projectIdForTask, new Map());
      }

      const kpiMap = projectKpiProgress.get(projectIdForTask);
      if (!kpiMap) continue;

      const kpiId = task.kpiId || "unknown";
      if (!kpiMap.has(kpiId)) {
        kpiMap.set(kpiId, { total: 0, count: 0 });
      }

      const kpiData = kpiMap.get(kpiId);
      if (kpiData) {
        const progressValue =
          typeof task.progress === "object" && task.progress?.percent != null
            ? task.progress.percent
            : 0;
        kpiData.total += progressValue;
        kpiData.count += 1;
      }
    }

    // Monta resultado
    const result: Record<string, string | number>[] = [];

    for (const [projId, kpiMap] of projectKpiProgress) {
      const projectName = projectNameMap.get(projId) || "Projeto Desconhecido";
      const row: Record<string, string | number> = { projectName };

      for (const [kpiId, data] of kpiMap) {
        if (kpiId !== "unknown" && data.count > 0) {
          row[kpiId] = Math.round(data.total / data.count);
        }
      }

      result.push(row);
    }

    return result;
  }

  /**
   * GET /reports/task-performance-per-game
   * Performance de tasks por game
   * Formato: [{ gameId, gameName, projectName, kpis: { [kpiId]: % } }]
   */
  async getTaskPerformancePerGame(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<
    {
      gameId: string;
      gameName: string;
      projectName: string;
      kpis: Record<string, number>;
    }[]
  > {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return [];
    }

    // Busca games dos projetos
    const gamesResult = await this.db
      .select({
        id: games.id,
        name: games.name,
        projectId: games.projectId,
      })
      .from(games)
      .where(
        and(
          eq(games.organizationId, organizationId),
          inArray(games.projectId, projectIds),
        ),
      );

    if (gamesResult.length === 0) {
      return [];
    }

    const gameIds = gamesResult.map((g) => g.id);

    // Busca nomes dos projetos
    const projectsResult = await this.db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(inArray(projects.id, projectIds));

    const projectNameMap = new Map(projectsResult.map((p) => [p.id, p.name]));

    // Busca todas as tasks dos games
    const tasksResult = await this.db
      .select({
        gameId: tasks.gameId,
        kpiId: tasks.kpiId,
        progress: tasks.progress,
      })
      .from(tasks)
      .where(inArray(tasks.gameId, gameIds));

    // Agrupa por game e KPI
    const gameKpiProgress = new Map<
      string,
      Map<string, { total: number; count: number }>
    >();

    for (const task of tasksResult) {
      if (!gameKpiProgress.has(task.gameId)) {
        gameKpiProgress.set(task.gameId, new Map());
      }

      const kpiMap = gameKpiProgress.get(task.gameId);
      if (!kpiMap) continue;

      const kpiId = task.kpiId || "unknown";
      if (!kpiMap.has(kpiId)) {
        kpiMap.set(kpiId, { total: 0, count: 0 });
      }

      const kpiData = kpiMap.get(kpiId);
      if (kpiData) {
        const progressValue =
          typeof task.progress === "object" && task.progress?.percent != null
            ? task.progress.percent
            : 0;
        kpiData.total += progressValue;
        kpiData.count += 1;
      }
    }

    // Monta resultado
    const result: {
      gameId: string;
      gameName: string;
      projectName: string;
      kpis: Record<string, number>;
    }[] = [];

    for (const game of gamesResult) {
      const kpis: Record<string, number> = {};
      const kpiMap = gameKpiProgress.get(game.id);

      if (kpiMap) {
        for (const [kpiId, data] of kpiMap) {
          if (kpiId !== "unknown" && data.count > 0) {
            kpis[kpiId] = Math.round(data.total / data.count);
          }
        }
      }

      result.push({
        gameId: game.id,
        gameName: game.name,
        projectName:
          projectNameMap.get(game.projectId) || "Projeto Desconhecido",
        kpis,
      });
    }

    return result;
  }

  /**
   * GET /reports/task-best-players
   * Melhores jogadores/teams por progresso de tasks
   * Formato: [{ progressPercent, kpiId, playerName, playerPhoto, userId, teamName, teamPhoto, teamId }]
   */
  async getTaskBestPlayers(
    organizationId: string,
    leagueId: string,
    sectorId?: string,
    projectId?: string,
  ): Promise<
    {
      progressPercent: number;
      kpiId: string;
      playerName: string;
      playerPhoto: string;
      userId: string;
      teamName: string;
      teamPhoto: string;
      teamId: string;
    }[]
  > {
    const projectIds = projectId
      ? [projectId]
      : await this.getLeagueProjectIds(organizationId, leagueId);

    if (projectIds.length === 0) {
      return [];
    }

    // Busca games dos projetos
    const gamesResult = await this.db
      .select({ id: games.id })
      .from(games)
      .where(
        and(
          eq(games.organizationId, organizationId),
          inArray(games.projectId, projectIds),
        ),
      );

    const gameIds = gamesResult.map((g) => g.id);

    if (gameIds.length === 0) {
      return [];
    }

    // Busca todas as tasks dos games
    const tasksResult = await this.db
      .select({
        teamId: tasks.teamId,
        userId: tasks.userId,
        kpiId: tasks.kpiId,
        progress: tasks.progress,
      })
      .from(tasks)
      .where(inArray(tasks.gameId, gameIds));

    // Agrupa por team/user e calcula média de progresso
    const entityProgress = new Map<
      string,
      {
        type: "player" | "team";
        entityId: string;
        kpiIds: Set<string>;
        total: number;
        count: number;
      }
    >();

    for (const task of tasksResult) {
      // Prioriza team sobre user
      const entityId = task.teamId || task.userId;
      const entityType: "player" | "team" = task.teamId ? "team" : "player";

      if (!entityId) continue;

      const key = `${entityType}:${entityId}`;
      if (!entityProgress.has(key)) {
        entityProgress.set(key, {
          type: entityType,
          entityId,
          kpiIds: new Set(),
          total: 0,
          count: 0,
        });
      }

      const data = entityProgress.get(key);
      if (data) {
        if (task.kpiId) {
          data.kpiIds.add(task.kpiId);
        }
        const progressValue =
          typeof task.progress === "object" && task.progress?.percent != null
            ? task.progress.percent
            : 0;
        data.total += progressValue;
        data.count += 1;
      }
    }

    // Busca nomes dos teams
    const teamIds = Array.from(entityProgress.values())
      .filter((e) => e.type === "team")
      .map((e) => e.entityId);

    const teamsResult =
      teamIds.length > 0
        ? await this.db
            .select({ id: teams.id, name: teams.name, photo: teams.photo })
            .from(teams)
            .where(inArray(teams.id, teamIds))
        : [];

    const teamMap = new Map(teamsResult.map((t) => [t.id, t]));

    // Busca nomes dos players (users)
    const userIds = Array.from(entityProgress.values())
      .filter((e) => e.type === "player")
      .map((e) => e.entityId);

    const usersResult =
      userIds.length > 0
        ? await this.db
            .select({
              id: users.id,
              nickname: users.nickname,
              photo: users.photo,
            })
            .from(users)
            .where(inArray(users.id, userIds))
        : [];

    const userMap = new Map(usersResult.map((u) => [u.id, u]));

    // Monta resultado
    const result: {
      progressPercent: number;
      kpiId: string;
      playerName: string;
      playerPhoto: string;
      userId: string;
      teamName: string;
      teamPhoto: string;
      teamId: string;
    }[] = [];

    for (const data of entityProgress.values()) {
      const progressPercent = data.count > 0 ? data.total / data.count : 0;
      const kpiId = Array.from(data.kpiIds).join(",");

      if (data.type === "team") {
        const team = teamMap.get(data.entityId);
        result.push({
          progressPercent,
          kpiId,
          playerName: "",
          playerPhoto: "",
          userId: "",
          teamName: team?.name || "",
          teamPhoto: team?.photo || "",
          teamId: data.entityId,
        });
      } else {
        const user = userMap.get(data.entityId);
        result.push({
          progressPercent,
          kpiId,
          playerName: user?.nickname || "",
          playerPhoto: user?.photo || "",
          userId: data.entityId,
          teamName: "",
          teamPhoto: "",
          teamId: "",
        });
      }
    }

    // Ordena por progressPercent decrescente
    result.sort((a, b) => b.progressPercent - a.progressPercent);

    return result;
  }
}
