import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateTeamDto } from "./dto/create-team.dto";
import { TeamResponseDto } from "./dto/team-response.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { TeamService } from "./team.service";

@ApiTags("teams")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/teams")
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: "Create a new team" })
  @ApiResponse({ status: 201, type: TeamResponseDto })
  async createTeam(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    const team = await this.teamService.createTeam({
      ...dto,
      organizationId,
    });
    return TeamResponseDto.fromEntity(team);
  }

  @Get(":teamId")
  @ApiOperation({ summary: "Get team by ID" })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async getTeam(
    @Param("organizationId") organizationId: string,
    @Param("teamId") teamId: string,
  ): Promise<TeamResponseDto> {
    const team = await this.teamService.getTeam(organizationId, teamId);
    return TeamResponseDto.fromEntity(team);
  }

  @Get()
  @ApiOperation({ summary: "List all teams of an organization" })
  @ApiResponse({ status: 200, type: [TeamResponseDto] })
  async listTeams(
    @Param("organizationId") organizationId: string,
  ): Promise<TeamResponseDto[]> {
    const teams = await this.teamService.listOrganizationTeams(organizationId);
    return teams.map(TeamResponseDto.fromEntity);
  }

  @Put(":teamId")
  @ApiOperation({ summary: "Update team" })
  @ApiResponse({ status: 200, type: TeamResponseDto })
  async updateTeam(
    @Param("organizationId") organizationId: string,
    @Param("teamId") teamId: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    const team = await this.teamService.updateTeam({
      organizationId,
      teamId,
      ...dto,
    });
    return TeamResponseDto.fromEntity(team);
  }

  @Delete(":teamId")
  @ApiOperation({ summary: "Delete team" })
  @ApiResponse({ status: 204 })
  async deleteTeam(
    @Param("organizationId") organizationId: string,
    @Param("teamId") teamId: string,
  ): Promise<void> {
    await this.teamService.deleteTeam(organizationId, teamId);
  }
}
