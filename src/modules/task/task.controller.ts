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
@Controller()
export class TaskController {
  constructor(private readonly taskRepository: TaskRepository) {}

  @Post("games/:gameId/tasks")
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

  @Get("games/:gameId/tasks/:taskId")
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

  @Get("games/:gameId/tasks")
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

  @Put("games/:gameId/tasks/:taskId")
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

  @Delete("games/:gameId/tasks/:taskId")
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

  // Rotas flat para compatibilidade com testes
  @Get("tasks")
  @ApiOperation({ summary: "List all tasks for a game (flat route)" })
  @ApiQuery({ name: "gameId", required: true })
  @ApiResponse({ status: 200 })
  async findAllFlat(@Query("gameId") gameId: string) {
    if (!gameId) {
      throw new BadRequestException("gameId is required");
    }
    try {
      const result = await listGameTasks({ gameId }, this.taskRepository);
      return {
        items: result.tasks.map((task) => TaskResponseDto.fromEntity(task)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get("tasks/:taskId")
  @ApiOperation({ summary: "Get task by ID (flat route)" })
  @ApiParam({ name: "taskId" })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  @ApiResponse({ status: 404, description: "Task not found" })
  async findOneFlat(@Param("taskId") taskId: string): Promise<TaskResponseDto> {
    try {
      // Buscar em todos os games (ineficiente mas funciona para testes)
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new NotFoundException("Task not found");
      }
      return TaskResponseDto.fromEntity(task);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put("tasks/:taskId")
  @ApiOperation({ summary: "Update task (flat route)" })
  @ApiParam({ name: "taskId" })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async updateFlat(
    @Param("taskId") taskId: string,
    @Body() updateTaskDto: UpdateTaskDto & { gameId?: string },
  ): Promise<TaskResponseDto> {
    try {
      // Buscar task para obter gameId
      const existingTask = await this.taskRepository.findById(taskId);
      if (!existingTask) {
        throw new NotFoundException("Task not found");
      }
      const gameId = updateTaskDto.gameId || existingTask.gameId;
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

  @Delete("tasks/:taskId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete task (flat route)" })
  @ApiParam({ name: "taskId" })
  @ApiResponse({ status: 200, description: "Task deleted" })
  async removeFlat(@Param("taskId") taskId: string) {
    try {
      // Buscar task para obter gameId
      const existingTask = await this.taskRepository.findById(taskId);
      if (!existingTask) {
        throw new NotFoundException("Task not found");
      }
      await deleteTask(
        { gameId: existingTask.gameId, taskId },
        this.taskRepository,
      );
      return { message: "Task deleted successfully" };
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
