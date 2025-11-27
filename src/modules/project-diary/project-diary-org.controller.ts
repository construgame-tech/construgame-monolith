import { ProjectDiaryRepository } from "@infrastructure/repositories/project-diary.repository";
import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

// DTO duplicado para não importar do outro controller
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

enum WeatherType {
  SUNNY = "SUNNY",
  CLOUDY = "CLOUDY",
  RAINY = "RAINY",
}

class WeatherDto {
  @IsOptional()
  @IsEnum(WeatherType)
  morning?: WeatherType;

  @IsOptional()
  @IsEnum(WeatherType)
  afternoon?: WeatherType;

  @IsOptional()
  @IsEnum(WeatherType)
  night?: WeatherType;
}

class EquipmentItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;
}

class ManpowerItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;
}

class UpsertProjectDiaryDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WeatherDto)
  weather?: WeatherDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipmentItemDto)
  equipment?: EquipmentItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManpowerItemDto)
  manpower?: ManpowerItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManpowerItemDto)
  indirectManpower?: ManpowerItemDto[];
}

/**
 * Controller para rotas de Project Diary no novo path com organizationId
 */
@ApiTags("project-diary")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/project/:projectId/diary")
export class ProjectDiaryOrgController {
  constructor(
    @Inject(ProjectDiaryRepository)
    private readonly repository: ProjectDiaryRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create or update project diary entry" })
  async upsertProjectDiary(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Body() body: UpsertProjectDiaryDto,
  ) {
    const diary = await this.repository.upsert({
      organizationId,
      projectId,
      date: body.date || new Date().toISOString().split("T")[0],
      notes: body.notes,
      weather: body.weather,
      equipment: body.equipment,
      manpower: body.manpower,
      indirectManpower: body.indirectManpower,
      sequence: 0,
    });

    return {
      organizationId: diary.organizationId,
      projectId: diary.projectId,
      date: diary.date,
      notes: diary.notes,
      weather: diary.weather,
      equipment: diary.equipment,
      manpower: diary.manpower,
      indirectManpower: diary.indirectManpower,
    };
  }

  @Get()
  @ApiOperation({ summary: "List project diary entries" })
  async listProjectDiaries(
    @Param("projectId") projectId: string,
    @Query("limit") limit?: string,
    @Query("date") date?: string,
  ) {
    const limitNum = limit ? Number.parseInt(limit, 10) : undefined;
    let diaries = await this.repository.listByProject(projectId, limitNum);

    if (date) {
      diaries = diaries.filter((diary) => diary.date === date);
    }

    return {
      items: diaries.map((diary) => ({
        organizationId: diary.organizationId,
        projectId: diary.projectId,
        date: diary.date,
        notes: diary.notes,
        weather: diary.weather,
        equipment: diary.equipment,
        manpower: diary.manpower,
        indirectManpower: diary.indirectManpower,
      })),
    };
  }

  @Get("options")
  @ApiOperation({
    summary: "List diary options (equipment and manpower names)",
  })
  async listDiaryOptions(@Param("projectId") projectId: string) {
    const diaries = await this.repository.listByProject(projectId);

    const equipmentSet = new Set<string>();
    const manpowerSet = new Set<string>();

    for (const diary of diaries) {
      if (diary.equipment) {
        for (const e of diary.equipment) {
          equipmentSet.add(e.name);
        }
      }
      if (diary.manpower) {
        for (const m of diary.manpower) {
          manpowerSet.add(m.name);
        }
      }
      if (diary.indirectManpower) {
        for (const m of diary.indirectManpower) {
          manpowerSet.add(m.name);
        }
      }
    }

    return {
      equipmentNames: Array.from(equipmentSet).sort(),
      manpowerNames: Array.from(manpowerSet).sort(),
    };
  }

  @Get(":date")
  @ApiOperation({ summary: "Get project diary by date" })
  async getProjectDiary(
    @Param("projectId") projectId: string,
    @Param("date") date: string,
  ) {
    const diary = await this.repository.getByDate(projectId, date);

    if (!diary) {
      return null;
    }

    return {
      organizationId: diary.organizationId,
      projectId: diary.projectId,
      date: diary.date,
      notes: diary.notes,
      weather: diary.weather,
      equipment: diary.equipment,
      manpower: diary.manpower,
      indirectManpower: diary.indirectManpower,
    };
  }

  @Put(":date")
  @ApiOperation({ summary: "Update project diary entry" })
  async updateProjectDiary(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("date") date: string,
    @Body() body: UpsertProjectDiaryDto,
  ) {
    const existing = await this.repository.getByDate(projectId, date);
    if (!existing) {
      throw new NotFoundException(`Diary entry for date ${date} not found`);
    }

    const diary = await this.repository.upsert({
      organizationId,
      projectId,
      date,
      notes: body.notes,
      weather: body.weather,
      equipment: body.equipment,
      manpower: body.manpower,
      indirectManpower: body.indirectManpower,
    });

    return {
      organizationId: diary.organizationId,
      projectId: diary.projectId,
      date: diary.date,
      notes: diary.notes,
      weather: diary.weather,
      equipment: diary.equipment,
      manpower: diary.manpower,
      indirectManpower: diary.indirectManpower,
    };
  }

  @Delete(":date")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete project diary entry" })
  async deleteProjectDiary(
    @Param("projectId") projectId: string,
    @Param("date") date: string,
  ) {
    const existing = await this.repository.getByDate(projectId, date);
    if (!existing) {
      throw new NotFoundException(`Diary entry for date ${date} not found`);
    }

    await this.repository.deleteByDate(projectId, date);

    return {
      message: "Diary entry deleted successfully",
    };
  }
}
