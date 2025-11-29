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
import { ChecklistTemplateService } from "./checklist-template.service";
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
    return this.taskTemplateService.create(organizationId, dto);
  }

  @Get(":templateId")
  @ApiOperation({ summary: "Get task template by ID" })
  async findById(@Param("templateId") templateId: string) {
    return this.taskTemplateService.findById(templateId);
  }

  @Get()
  @ApiOperation({ summary: "List task templates by organization" })
  async findByOrganization(@Param("organizationId") organizationId: string) {
    const items =
      await this.taskTemplateService.findByOrganizationId(organizationId);
    return { items };
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

// Controller para checklist templates reutilizáveis
@ApiTags("checklist-templates")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/checklist-template")
export class ChecklistTemplateController {
  constructor(
    private readonly checklistTemplateService: ChecklistTemplateService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List organization checklist templates" })
  async findByOrganization(@Param("organizationId") organizationId: string) {
    const items =
      await this.checklistTemplateService.findByOrganizationId(organizationId);
    return { items };
  }

  @Post()
  @ApiOperation({ summary: "Create checklist template" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateChecklistTemplateDto,
  ) {
    // Conforme API original, checklist armazena apenas { label }
    const checklist = (dto.checklist || []).map((item) => ({
      label: item.label,
    }));

    return this.checklistTemplateService.create({
      organizationId,
      name: dto.name,
      checklist,
    });
  }

  @Delete(":checklistTemplateId")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete checklist template" })
  async delete(
    @Param("organizationId") organizationId: string,
    @Param("checklistTemplateId") checklistTemplateId: string,
  ) {
    // Verifica se existe e pertence à organização
    const template =
      await this.checklistTemplateService.findById(checklistTemplateId);

    if (template.organizationId !== organizationId) {
      throw new NotFoundException("Checklist template not found");
    }

    await this.checklistTemplateService.delete(checklistTemplateId);

    return {}; // API original retorna objeto vazio
  }
}
