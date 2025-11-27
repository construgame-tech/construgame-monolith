import { randomUUID } from "node:crypto";
import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateChecklistTemplateDto } from "./dto/create-checklist-template.dto";
import { CreateTaskTemplateDto } from "./dto/create-task-template.dto";
import { UpdateTaskTemplateDto } from "./dto/update-task-template.dto";
import { TaskTemplateService } from "./task-template.service";

@ApiTags("task-templates")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/task-template")
export class TaskTemplateController {
  constructor(
    @Inject(TaskTemplateService)
    private readonly taskTemplateService: TaskTemplateService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a task template" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateTaskTemplateDto,
  ) {
    return this.taskTemplateService.create({ ...dto, organizationId });
  }

  @Get(":templateId")
  @ApiOperation({ summary: "Get task template by ID" })
  async findById(@Param("templateId") templateId: string) {
    return this.taskTemplateService.findById(templateId);
  }

  @Get()
  @ApiOperation({ summary: "List task templates by organization" })
  async findByOrganization(@Param("organizationId") organizationId: string) {
    return this.taskTemplateService.findByOrganizationId(organizationId);
  }

  @Put(":templateId")
  @ApiOperation({ summary: "Update a task template" })
  async update(
    @Param("templateId") templateId: string,
    @Body() dto: UpdateTaskTemplateDto,
  ) {
    return this.taskTemplateService.update(templateId, dto);
  }

  @Delete(":templateId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a task template" })
  async delete(@Param("templateId") templateId: string) {
    await this.taskTemplateService.delete(templateId);
    return { message: "Task template deleted successfully" };
  }
}

// In-memory storage for checklist templates (for MVP, can be replaced with DB later)
const checklistTemplatesStore = new Map<
  string,
  {
    id: string;
    organizationId: string;
    name: string;
    checklist: Array<{ id: string; label: string }>;
  }
>();

// Controller para checklist templates
@ApiTags("task-templates")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/checklist-template")
export class ChecklistTemplateController {
  @Get()
  @ApiOperation({ summary: "List organization checklist templates" })
  async findByOrganization(@Param("organizationId") organizationId: string) {
    const items = Array.from(checklistTemplatesStore.values()).filter(
      (t) => t.organizationId === organizationId,
    );
    return { items };
  }

  @Post()
  @ApiOperation({ summary: "Create checklist template" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateChecklistTemplateDto,
  ) {
    const id = randomUUID();
    const checklist = (dto.checklist || []).map((item) => ({
      id: item.id || randomUUID(),
      label: item.label,
    }));

    const template = {
      id,
      organizationId,
      name: dto.name,
      checklist,
    };

    checklistTemplatesStore.set(id, template);

    return template;
  }

  @Delete(":checklistTemplateId")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete checklist template" })
  async delete(
    @Param("organizationId") organizationId: string,
    @Param("checklistTemplateId") checklistTemplateId: string,
  ) {
    const template = checklistTemplatesStore.get(checklistTemplateId);
    if (!template || template.organizationId !== organizationId) {
      throw new NotFoundException("Checklist template not found");
    }

    checklistTemplatesStore.delete(checklistTemplateId);

    return { message: "Checklist template deleted" };
  }
}
