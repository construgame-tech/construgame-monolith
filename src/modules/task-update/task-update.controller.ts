import { CurrentUser } from "@modules/auth/current-user.decorator";
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
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ApproveTaskUpdateDto } from "./dto/approve-task-update.dto";
import { CreateTaskUpdateDto } from "./dto/create-task-update.dto";
import { CreateTaskUpdateSingularDto } from "./dto/create-task-update-singular.dto";
import { RejectTaskUpdateDto } from "./dto/reject-task-update.dto";
import { TaskUpdateService } from "./task-update.service";

@ApiTags("task-updates")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskUpdateController {
  constructor(
    @Inject(TaskUpdateService)
    private readonly taskUpdateService: TaskUpdateService,
  ) {}

  @Post("games/:gameId/task-updates")
  @ApiOperation({ summary: "Create a task update" })
  async create(
    @Param("gameId") gameId: string,
    @Body() dto: CreateTaskUpdateDto,
  ) {
    return this.taskUpdateService.create({ ...dto, gameId });
  }

  @Get("task-updates/:updateId")
  @ApiOperation({ summary: "Get task update by ID" })
  async findById(@Param("updateId") updateId: string) {
    return this.taskUpdateService.findById(updateId);
  }

  @Get("tasks/:taskId/task-updates")
  @ApiOperation({ summary: "List task updates by task" })
  async findByTask(@Param("taskId") taskId: string) {
    return this.taskUpdateService.findByTaskId(taskId);
  }

  @Get("games/:gameId/task-updates")
  @ApiOperation({ summary: "List task updates by game" })
  @ApiQuery({ name: "status", required: false, type: String })
  async findByGame(
    @Param("gameId") gameId: string,
    @Query("status") status?: string,
  ) {
    if (status) {
      return this.taskUpdateService.findByStatus(gameId, status as any);
    }
    return this.taskUpdateService.findByGameId(gameId);
  }

  @Put("task-updates/:updateId/approve")
  @ApiOperation({ summary: "Approve a task update" })
  async approve(
    @Param("updateId") updateId: string,
    @Body() dto: ApproveTaskUpdateDto,
    @CurrentUser() user: { userId: string },
  ) {
    // Se reviewedBy não foi informado, usa o userId do token JWT
    const reviewedBy = dto.reviewedBy || user.userId;
    return this.taskUpdateService.approve(updateId, { ...dto, reviewedBy });
  }

  @Put("task-updates/:updateId/reject")
  @ApiOperation({ summary: "Reject a task update" })
  async reject(
    @Param("updateId") updateId: string,
    @Body() dto: RejectTaskUpdateDto,
    @CurrentUser() user: { userId: string },
  ) {
    // Se reviewedBy não foi informado, usa o userId do token JWT
    const reviewedBy = dto.reviewedBy || user.userId;
    return this.taskUpdateService.reject(updateId, { ...dto, reviewedBy });
  }

  @Delete("task-updates/:updateId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a task update" })
  async delete(@Param("updateId") updateId: string) {
    await this.taskUpdateService.delete(updateId);
    return { message: "Task update deleted successfully" };
  }

  // ==========================================
  // Rotas com prefixo /game/:gameId/task/:taskId/update (OpenAPI spec)
  // ==========================================

  @Post("game/:gameId/task/:taskId/update")
  @ApiOperation({ summary: "Add task update (singular route)" })
  async createSingular(
    @Param("gameId") gameId: string,
    @Param("taskId") taskId: string,
    @Body() dto: CreateTaskUpdateSingularDto,
    @CurrentUser() user: { userId: string; username: string; roles: string[]; userType: string },
  ) {
    // Extrai userId do token JWT (JwtStrategy.validate retorna userId, não sub)
    const submittedBy = user.userId;

    const now = new Date().toISOString();

    return this.taskUpdateService.create({
      gameId,
      taskId,
      submittedBy,
      participants: dto.participants,
      photos: dto.photos,
      startDate: dto.startDate,
      endDate: dto.endDate,
      progress: {
        absolute: dto.absolute,
        percent: dto.percent,
        hours: dto.hours,
        note: dto.note,
        updatedAt: now,
      },
      checklist: dto.checklist?.map((item) => ({
        id: item.id,
        checked: item.checked,
      })),
      files: dto.files,
    });
  }

  @Put("game/:gameId/task/:taskId/update/:taskUpdateId/approve")
  @ApiOperation({ summary: "Approve task update (singular route)" })
  async approveSingular(
    @Param("gameId") _gameId: string,
    @Param("taskId") _taskId: string,
    @Param("taskUpdateId") taskUpdateId: string,
    @Body() dto: ApproveTaskUpdateDto,
    @CurrentUser() user: { userId: string },
  ) {
    // Se reviewedBy não foi informado, usa o userId do token JWT
    const reviewedBy = dto.reviewedBy || user.userId;
    return this.taskUpdateService.approve(taskUpdateId, { ...dto, reviewedBy });
  }

  @Put("game/:gameId/task/:taskId/update/:taskUpdateId/reject")
  @ApiOperation({ summary: "Reject task update (singular route)" })
  async rejectSingular(
    @Param("gameId") _gameId: string,
    @Param("taskId") _taskId: string,
    @Param("taskUpdateId") taskUpdateId: string,
    @Body() dto: RejectTaskUpdateDto,
    @CurrentUser() user: { userId: string },
  ) {
    // Se reviewedBy não foi informado, usa o userId do token JWT
    const reviewedBy = dto.reviewedBy || user.userId;
    return this.taskUpdateService.reject(taskUpdateId, { ...dto, reviewedBy });
  }

  @Put("game/:gameId/task/:taskId/update/:taskUpdateId/cancel")
  @ApiOperation({ summary: "Cancel task update" })
  async cancel(
    @Param("gameId") _gameId: string,
    @Param("taskId") _taskId: string,
    @Param("taskUpdateId") taskUpdateId: string,
  ) {
    return this.taskUpdateService.cancel(taskUpdateId);
  }

  // ==========================================
  // GET /organization/:organizationId/task/update - List updates for organization
  // ==========================================

  @Get("organization/:organizationId/task/update")
  @ApiOperation({ summary: "List task updates for organization" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "submittedBy", required: false })
  @ApiQuery({ name: "taskId", required: false })
  @ApiQuery({ name: "teamId", required: false })
  @ApiQuery({ name: "gameId", required: false })
  @ApiQuery({ name: "kpiId", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async listByOrganization(
    @Param("organizationId") organizationId: string,
    @Query("status") status?: string,
    @Query("submittedBy") submittedBy?: string,
    @Query("taskId") taskId?: string,
    @Query("teamId") teamId?: string,
    @Query("gameId") gameId?: string,
    @Query("kpiId") kpiId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const result = await this.taskUpdateService.findByOrganizationId(
      organizationId,
      {
        status: status as any,
        submittedBy,
        taskId,
        teamId,
        gameId,
        kpiId,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
    return {
      items: result.items,
      total: result.total,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    };
  }
}
