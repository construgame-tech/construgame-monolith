import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PointsService } from "./points.service";

@ApiTags("points")
@UseGuards(JwtAuthGuard)
@Controller()
export class PointsController {
  constructor(
    @Inject(PointsService)
    private readonly pointsService: PointsService,
  ) {}

  // User Game Points
  @Get("users/:userId/games/:gameId/points")
  @ApiOperation({ summary: "Get user game points" })
  async getUserGamePoints(
    @Param("userId") userId: string,
    @Param("gameId") gameId: string,
  ) {
    return this.pointsService.getUserGamePoints(userId, gameId);
  }

  @Get("games/:gameId/user-points/leaderboard")
  @ApiOperation({ summary: "Get user game points leaderboard" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getUserGamePointsLeaderboard(
    @Param("gameId") gameId: string,
    @Query("limit") limit?: number,
  ) {
    return this.pointsService.getUserGamePointsLeaderboard(
      gameId,
      limit ? Number(limit) : 10,
    );
  }

  // Team Game Points
  @Get("teams/:teamId/games/:gameId/points")
  @ApiOperation({ summary: "Get team game points" })
  async getTeamGamePoints(
    @Param("teamId") teamId: string,
    @Param("gameId") gameId: string,
  ) {
    return this.pointsService.getTeamGamePoints(teamId, gameId);
  }

  @Get("games/:gameId/team-points/leaderboard")
  @ApiOperation({ summary: "Get team game points leaderboard" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTeamGamePointsLeaderboard(
    @Param("gameId") gameId: string,
    @Query("limit") limit?: number,
  ) {
    return this.pointsService.getTeamGamePointsLeaderboard(
      gameId,
      limit ? Number(limit) : 10,
    );
  }

  // Kaizen Points
  @Get("users/:userId/games/:gameId/kaizen-points")
  @ApiOperation({ summary: "Get user kaizen points" })
  async getUserKaizenPoints(
    @Param("userId") userId: string,
    @Param("gameId") gameId: string,
  ) {
    return this.pointsService.getUserKaizenPoints(userId, gameId);
  }

  @Get("teams/:teamId/games/:gameId/kaizen-points")
  @ApiOperation({ summary: "Get team kaizen points" })
  async getTeamKaizenPoints(
    @Param("teamId") teamId: string,
    @Param("gameId") gameId: string,
  ) {
    return this.pointsService.getTeamKaizenPoints(teamId, gameId);
  }

  @Get("games/:gameId/kaizen-points")
  @ApiOperation({ summary: "Get game kaizen points" })
  async getGameKaizenPoints(@Param("gameId") gameId: string) {
    return this.pointsService.getGameKaizenPoints(gameId);
  }

  // Task Points
  @Get("users/:userId/games/:gameId/task-points")
  @ApiOperation({ summary: "Get user task points" })
  async getUserTaskPoints(
    @Param("userId") userId: string,
    @Param("gameId") gameId: string,
  ) {
    return this.pointsService.getUserTaskPoints(userId, gameId);
  }

  @Get("teams/:teamId/games/:gameId/task-points")
  @ApiOperation({ summary: "Get team task points" })
  async getTeamTaskPoints(
    @Param("teamId") teamId: string,
    @Param("gameId") gameId: string,
  ) {
    return this.pointsService.getTeamTaskPoints(teamId, gameId);
  }

  @Get("games/:gameId/task-points")
  @ApiOperation({ summary: "Get game task points" })
  async getGameTaskPoints(@Param("gameId") gameId: string) {
    return this.pointsService.getGameTaskPoints(gameId);
  }
}
