import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateTeamDto } from "./dto/create-team.dto";
import { TeamResponseDto } from "./dto/team-response.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { TeamService } from "./team.service";

// Import DTOs
class ImportTeamItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  members?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fieldOfAction?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;
}

class ImportTeamsBodyDto {
  @ApiProperty({ type: [ImportTeamItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTeamItemDto)
  teams: ImportTeamItemDto[];
}

@ApiTags("team")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/team")
export class TeamController {
  constructor(
    @Inject(TeamService)
    private readonly teamService: TeamService,
  ) {}

  @Post("import")
  @ApiOperation({ summary: "Import teams in bulk" })
  @ApiResponse({ status: 200, description: "Bulk import completed" })
  async importTeams(
    @Param("organizationId") organizationId: string,
    @Body() body: ImportTeamsBodyDto,
  ) {
    const success: Array<{ id: string; name: string }> = [];
    const duplicates: Array<{ name: string; reason: string }> = [];

    // Buscar teams existentes para verificar duplicatas
    const existingTeams =
      await this.teamService.listOrganizationTeams(organizationId);
    const existingNames = new Set(
      existingTeams.map((t) => t.name.toLowerCase()),
    );

    for (const teamData of body.teams) {
      // Verificar duplicata por nome (case-insensitive)
      if (existingNames.has(teamData.name.toLowerCase())) {
        duplicates.push({
          name: teamData.name,
          reason: "Team with this name already exists",
        });
        continue;
      }

      try {
        const team = await this.teamService.createTeam({
          organizationId,
          name: teamData.name,
          managerId: teamData.managerId,
          members: teamData.members,
          fieldOfAction: teamData.fieldOfAction,
          photo: teamData.photo,
        });

        success.push({
          id: team.id,
          name: team.name,
        });

        existingNames.add(teamData.name.toLowerCase());
      } catch (error) {
        duplicates.push({
          name: teamData.name,
          reason: error.message || "Failed to create team",
        });
      }
    }

    return {
      success,
      duplicates,
      summary: {
        total: body.teams.length,
        imported: success.length,
        duplicated: duplicates.length,
      },
    };
  }

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
  @ApiResponse({ status: 200 })
  async listTeams(
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: TeamResponseDto[] }> {
    const teams = await this.teamService.listOrganizationTeams(organizationId);
    return { items: teams.map(TeamResponseDto.fromEntity) };
  }

  @Patch(":teamId")
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
  @HttpCode(204)
  @ApiOperation({ summary: "Delete team" })
  @ApiResponse({ status: 204 })
  async deleteTeam(
    @Param("organizationId") organizationId: string,
    @Param("teamId") teamId: string,
  ): Promise<void> {
    await this.teamService.deleteTeam(organizationId, teamId);
  }
}
