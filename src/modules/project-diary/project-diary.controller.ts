import { ProjectDiaryRepository } from "@infrastructure/repositories/project-diary.repository";
import {
  BadRequestException,
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
} from "@nestjs/common";

// DTOs
class UpsertProjectDiaryDto {
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

@Controller()
export class ProjectDiaryController {
  constructor(
    @Inject(ProjectDiaryRepository)
    private readonly repository: ProjectDiaryRepository,
  ) {}

  @Post("organizations/:organizationId/projects/:projectId/diaries/:date")
  async upsertProjectDiary(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("date") date: string, // YYYY-MM-DD
    @Body() body: UpsertProjectDiaryDto,
  ) {
    const diary = await this.repository.upsert({
      organizationId,
      projectId,
      date,
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

  @Get("organizations/:organizationId/projects/:projectId/diaries/:date")
  async getProjectDiary(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Param("date") date: string,
  ) {
    const diary = await this.repository.getByDate(projectId, date);

    if (!diary) {
      return null;
    }

    // Verify organization ownership
    if (diary.organizationId !== organizationId) {
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

  @Get("organizations/:organizationId/projects/:projectId/diaries")
  async listProjectDiaries(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
    @Query("limit") limit?: string,
  ) {
    const limitNum = limit ? Number.parseInt(limit, 10) : undefined;
    const diaries = await this.repository.listByProject(projectId, limitNum);

    // Filter by organization
    const filtered = diaries.filter((d) => d.organizationId === organizationId);

    return {
      items: filtered.map((diary) => ({
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
  @Get("organizations/:organizationId/projects/:projectId/diary-options")
  async listDiaryOptions(
    @Param("organizationId") organizationId: string,
    @Param("projectId") projectId: string,
  ) {
    const diaries = await this.repository.listByProject(projectId);

    // Extract unique equipment and manpower names
    const equipmentSet = new Set<string>();
    const manpowerSet = new Set<string>();

    for (const diary of diaries) {
      if (diary.organizationId !== organizationId) continue;

      diary.equipment?.forEach((e) => equipmentSet.add(e.name));
      diary.manpower?.forEach((m) => manpowerSet.add(m.name));
      diary.indirectManpower?.forEach((m) => manpowerSet.add(m.name));
    }

    return {
      equipment: Array.from(equipmentSet).sort(),
      manpower: Array.from(manpowerSet).sort(),
    };
  }
}
