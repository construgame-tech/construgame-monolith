import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { LeagueService } from "./league.service";
import { LeagueReportsService } from "./league-reports.service";

// DTO para ranking
class RankingItemDto {
  userId?: string;
  teamId?: string;
  gameId?: string;
  projectId?: string;
  points: number;
  sector?: string;
}

class LeagueRankingResponseDto {
  ranking: RankingItemDto[];
}

@ApiTags("ranking")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class LeagueRankingController {
  constructor(
    @Inject(LeagueService)
    private readonly leagueService: LeagueService,
  ) {}

  @Get("league/:leagueId/ranking")
  @ApiOperation({ summary: "Get league ranking" })
  @ApiQuery({
    name: "groupBy",
    required: false,
    enum: ["project", "team", "user"],
  })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiResponse({ status: 200, type: LeagueRankingResponseDto })
  async getLeagueRanking(
    @Param("leagueId") _leagueId: string,
    @Query("groupBy") _groupBy?: string,
    @Query("sectorId") _sectorId?: string,
  ) {
    // Stub: retorna ranking vazio por enquanto
    return {
      ranking: [],
    };
  }
}

@ApiTags("league-dashboards")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/league/:leagueId/reports")
export class LeagueReportsController {
  constructor(
    @Inject(LeagueReportsService)
    private readonly reportsService: LeagueReportsService,
  ) {}

  @Get("most-replicated-kaizens")
  @ApiOperation({ summary: "Get most replicated kaizens" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  @ApiQuery({ name: "isReplica", required: false, type: Boolean })
  @ApiQuery({
    name: "category",
    required: false,
    enum: ["1", "2", "3", "4", "5"],
  })
  async getMostReplicatedKaizens(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
    @Query("isReplica") isReplica?: boolean,
    @Query("category") category?: string,
  ) {
    return this.reportsService.getMostReplicatedKaizens(
      organizationId,
      leagueId,
      sectorId,
      projectId,
      isReplica,
      category,
    );
  }

  @Get("kaizen-counters")
  @ApiOperation({ summary: "Get kaizen counters" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizenCounters(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizenCounters(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-project-per-participant")
  @ApiOperation({ summary: "Get kaizens per project per participant" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerProjectPerParticipant(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerProjectPerParticipant(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-project")
  @ApiOperation({ summary: "Get kaizens per project" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerProject(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerProject(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-week")
  @ApiOperation({ summary: "Get kaizens per week" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerWeek(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerWeek(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-sector")
  @ApiOperation({ summary: "Get kaizens per sector" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerSector(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerSector(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-position")
  @ApiOperation({ summary: "Get kaizens per position" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerPosition(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerPosition(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-type")
  @ApiOperation({ summary: "Get kaizens per type" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerType(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerType(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-benefit")
  @ApiOperation({ summary: "Get kaizens per benefit" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerBenefit(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerBenefit(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-per-type-per-project")
  @ApiOperation({ summary: "Get kaizens per type per project" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerTypePerProject(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensPerTypePerProject(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-adherence-percentage")
  @ApiOperation({ summary: "Get kaizens adherence percentage" })
  @ApiQuery({ name: "kaizenTypeId", required: false, type: String })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensAdherencePercentage(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("kaizenTypeId") kaizenTypeId?: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensAdherencePercentageWithFilter(
      organizationId,
      leagueId,
      kaizenTypeId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-adherence-count")
  @ApiOperation({
    summary: "Get kaizens adherence count (possible vs executed)",
  })
  @ApiQuery({ name: "kaizenTypeId", required: false, type: String })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensAdherenceCount(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("kaizenTypeId") kaizenTypeId?: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensAdherenceCount(
      organizationId,
      leagueId,
      kaizenTypeId,
      sectorId,
      projectId,
    );
  }

  @Get("kaizens-adherence")
  @ApiOperation({ summary: "Get kaizens adherence" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensAdherence(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-participants-per-project")
  @ApiOperation({ summary: "Get kaizens participants per project" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensParticipantsPerProject(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getKaizensParticipantsPerProject(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  // Task reports

  @Get("task-counters")
  @ApiOperation({ summary: "Get task counters" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getTaskCounters(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getTaskCounters(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("task-performance-per-project")
  @ApiOperation({ summary: "Get task performance per project" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getTaskPerformancePerProject(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getTaskPerformancePerProject(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("task-performance-per-game")
  @ApiOperation({ summary: "Get task performance per game" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getTaskPerformancePerGame(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getTaskPerformancePerGame(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }

  @Get("task-best-players")
  @ApiOperation({ summary: "Get task best players" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getTaskBestPlayers(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Query("sectorId") sectorId?: string,
    @Query("projectId") projectId?: string,
  ) {
    return this.reportsService.getTaskBestPlayers(
      organizationId,
      leagueId,
      sectorId,
      projectId,
    );
  }
}
