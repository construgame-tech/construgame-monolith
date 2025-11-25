import { ProjectDiaryRepository } from "@infrastructure/repositories/project-diary.repository";
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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// DTOs
class UpsertProjectDiaryDto {
  date?: string;
  notes?: string;
  weather?: {
    morning?: "SUNNY" | "CLOUDY" | "RAINY";
    afternoon?: "SUNNY" | "CLOUDY" | "RAINY";
    night?: "SUNNY" | "CLOUDY" | "RAINY";
  };
  equipment?: Array<{
    name: string;
    quantity: number;
  }>;
  manpower?: Array<{
    name: string;
    quantity: number;
  }>;
  indirectManpower?: Array<{
    name: string;
    quantity: number;
  }>;
}

@ApiTags("project-diary")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projects/:projectId/diary")
export class ProjectDiaryController {
  constructor(
    @Inject(ProjectDiaryRepository)
    private readonly repository: ProjectDiaryRepository,
  ) {}

  @Post()
  async upsertProjectDiary(
    @Param("projectId") projectId: string,
    @Body() body: UpsertProjectDiaryDto & { organizationId: string },
  ) {
    const diary = await this.repository.upsert({
      organizationId: body.organizationId,
      projectId,
      date: body.date || new Date().toISOString().split("T")[0],
      notes: body.notes,
      weather: body.weather,
      equipment: body.equipment,
      manpower: body.manpower,
      indirectManpower: body.indirectManpower,
      sequence: 0, // Will be incremented if exists
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

  @Get(":date")
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

  @Get()
  async listProjectDiaries(
    @Param("projectId") projectId: string,
    @Query("limit") limit?: string,
    @Query("date") date?: string,
  ) {
    const limitNum = limit ? Number.parseInt(limit, 10) : undefined;
    let diaries = await this.repository.listByProject(projectId, limitNum);

    // Filter by date if provided
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

  // Endpoint adicional para listar opções (equipamentos e mão de obra já usados)
  @Get("options")
  async listDiaryOptions(@Param("projectId") projectId: string) {
    const diaries = await this.repository.listByProject(projectId);

    // Extract unique equipment and manpower names
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

  @Put(":date")
  async updateProjectDiary(
    @Param("projectId") projectId: string,
    @Param("date") date: string,
    @Body() body: UpsertProjectDiaryDto & { organizationId: string },
  ) {
    const existing = await this.repository.getByDate(projectId, date);
    if (!existing) {
      throw new NotFoundException(`Diary entry for date ${date} not found`);
    }

    const diary = await this.repository.upsert({
      organizationId: body.organizationId,
      projectId,
      date,
      notes: body.notes,
      weather: body.weather,
      equipment: body.equipment,
      manpower: body.manpower,
      indirectManpower: body.indirectManpower,
      sequence: existing.sequence,
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
