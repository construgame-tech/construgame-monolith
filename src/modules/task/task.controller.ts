import {
  createTask,
  deleteTask,
  getTask,
  listGameTasks,
  updateTask,
} from "@domain/task";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskResponseDto } from "./dto/task-response.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@ApiTags("tasks")
@ApiBearerAuth("JWT-auth")
@Controller("games/:gameId/tasks")
export class TaskController {
  constructor(private readonly taskRepository: TaskRepository) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  @ApiParam({ name: "gameId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  async create(
    @Param("gameId") gameId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    try {
      if (createTaskDto.gameId !== gameId) {
        throw new BadRequestException("Game ID mismatch");
      }
      const result = await createTask(createTaskDto, this.taskRepository);
      return TaskResponseDto.fromEntity(result.task);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(":taskId")
  @ApiOperation({ summary: "Get task by ID" })
  @ApiParam({ name: "gameId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiParam({ name: "taskId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiResponse({ status: 404, description: "Task not found" })
  async findOne(
    @Param("gameId") gameId: string,
    @Param("taskId") taskId: string,
  ): Promise<TaskResponseDto> {
    try {
      const result = await getTask({ gameId, taskId }, this.taskRepository);
      return TaskResponseDto.fromEntity(result.task);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: "List all tasks for a game" })
  @ApiParam({ name: "gameId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: [TaskResponseDto] })
  async findAll(@Param("gameId") gameId: string): Promise<TaskResponseDto[]> {
    try {
      const result = await listGameTasks({ gameId }, this.taskRepository);
      return result.tasks.map((task) => TaskResponseDto.fromEntity(task));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(":taskId")
  @ApiOperation({ summary: "Update task" })
  @ApiParam({ name: "gameId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiParam({ name: "taskId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async update(
    @Param("gameId") gameId: string,
    @Param("taskId") taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    try {
      const result = await updateTask(
        { gameId, taskId, ...updateTaskDto },
        this.taskRepository,
      );
      return TaskResponseDto.fromEntity(result.task);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(":taskId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete task" })
  @ApiParam({ name: "gameId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiParam({ name: "taskId", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 204, description: "Task deleted" })
  async remove(
    @Param("gameId") gameId: string,
    @Param("taskId") taskId: string,
  ): Promise<void> {
    try {
      await deleteTask({ gameId, taskId }, this.taskRepository);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
