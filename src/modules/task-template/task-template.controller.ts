import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
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
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateTaskTemplateDto } from "./dto/create-task-template.dto";
import { UpdateTaskTemplateDto } from "./dto/update-task-template.dto";
import { TaskTemplateService } from "./task-template.service";

@ApiTags("task-templates")
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/task-templates")
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
