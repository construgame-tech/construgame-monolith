import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateLeagueDto } from "./dto/create-league.dto";
import { LeagueResponseDto } from "./dto/league-response.dto";
import { UpdateLeagueDto } from "./dto/update-league.dto";
import { LeagueService } from "./league.service";

@ApiTags("leagues")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/league")
export class LeagueController {
  constructor(
    @Inject(LeagueService)
    private readonly leagueService: LeagueService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new league" })
  @ApiResponse({ status: 201, type: LeagueResponseDto })
  async createLeague(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateLeagueDto,
  ): Promise<LeagueResponseDto> {
    const league = await this.leagueService.createLeague({
      ...dto,
      organizationId,
    });
    return LeagueResponseDto.fromEntity(league);
  }

  @Get(":leagueId")
  @ApiOperation({ summary: "Get league by ID" })
  @ApiResponse({ status: 200, type: LeagueResponseDto })
  async getLeague(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
  ): Promise<LeagueResponseDto> {
    const league = await this.leagueService.getLeague(organizationId, leagueId);
    return LeagueResponseDto.fromEntity(league);
  }

  @Get()
  @ApiOperation({ summary: "List all leagues of an organization" })
  @ApiResponse({ status: 200 })
  async listLeagues(
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: LeagueResponseDto[] }> {
    const leagues = await this.leagueService.listByOrganization(organizationId);
    return { items: leagues.map(LeagueResponseDto.fromEntity) };
  }

  @Put(":leagueId")
  @ApiOperation({ summary: "Update league" })
  @ApiResponse({ status: 200, type: LeagueResponseDto })
  async updateLeague(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
    @Body() dto: UpdateLeagueDto,
  ): Promise<LeagueResponseDto> {
    // Spread dto first, then override with path params to ensure they take precedence
    const league = await this.leagueService.updateLeague({
      ...dto,
      organizationId,
      leagueId,
    });
    return LeagueResponseDto.fromEntity(league);
  }

  @Delete(":leagueId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete league" })
  @ApiResponse({ status: 204 })
  async deleteLeague(
    @Param("organizationId") organizationId: string,
    @Param("leagueId") leagueId: string,
  ): Promise<void> {
    await this.leagueService.deleteLeague(organizationId, leagueId);
  }
}
