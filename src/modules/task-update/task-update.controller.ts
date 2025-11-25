import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ApproveTaskUpdateDto } from "./dto/approve-task-update.dto";
import { CreateTaskUpdateDto } from "./dto/create-task-update.dto";
import { RejectTaskUpdateDto } from "./dto/reject-task-update.dto";
import { TaskUpdateService } from "./task-update.service";

@ApiTags("task-updates")
@Controller()
@UseGuards(JwtAuthGuard)
export class TaskUpdateController {
  constructor(private readonly taskUpdateService: TaskUpdateService) {}

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
  ) {
    return this.taskUpdateService.approve(updateId, dto);
  }

  @Put("task-updates/:updateId/reject")
  @ApiOperation({ summary: "Reject a task update" })
  async reject(
    @Param("updateId") updateId: string,
    @Body() dto: RejectTaskUpdateDto,
  ) {
    return this.taskUpdateService.reject(updateId, dto);
  }

  @Delete("task-updates/:updateId")
  @ApiOperation({ summary: "Delete a task update" })
  async delete(@Param("updateId") updateId: string) {
    await this.taskUpdateService.delete(updateId);
    return { message: "Task update deleted successfully" };
  }
}
