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

  @Get("leagues/:leagueId/ranking")
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
@Controller("organization/:organizationId/league/:leagueId/report")
export class LeagueReportsController {
  constructor(
    @Inject(LeagueService)
    private readonly leagueService: LeagueService,
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
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
    @Query("isReplica") _isReplica?: boolean,
    @Query("category") _category?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizen-counters")
  @ApiOperation({ summary: "Get kaizen counters" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizenCounters(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return {
      projectCount: 0,
      kaizenCount: 0,
      kaizenAveragePerProject: 0,
      kaizensPerProject: 0,
      kaizensPerParticipant: 0,
    };
  }

  @Get("kaizens-per-project-per-participant")
  @ApiOperation({ summary: "Get kaizens per project per participant" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerProjectPerParticipant(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-project")
  @ApiOperation({ summary: "Get kaizens per project" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerProject(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-week")
  @ApiOperation({ summary: "Get kaizens per week" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerWeek(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-sector")
  @ApiOperation({ summary: "Get kaizens per sector" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerSector(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-position")
  @ApiOperation({ summary: "Get kaizens per position" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerPosition(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-type")
  @ApiOperation({ summary: "Get kaizens per type" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerType(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-benefit")
  @ApiOperation({ summary: "Get kaizens per benefit" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerBenefit(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-per-type-per-project")
  @ApiOperation({ summary: "Get kaizens per type per project" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensPerTypePerProject(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }

  @Get("kaizens-adherence-percentage")
  @ApiOperation({ summary: "Get kaizens adherence percentage" })
  @ApiQuery({ name: "sectorId", required: false, type: String })
  @ApiQuery({ name: "projectId", required: false, type: String })
  async getKaizensAdherencePercentage(
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
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
    @Param("organizationId") _organizationId: string,
    @Param("leagueId") _leagueId: string,
    @Query("sectorId") _sectorId?: string,
    @Query("projectId") _projectId?: string,
  ) {
    return { items: [] };
  }
}
