import { GameRepository } from "@infrastructure/repositories/game.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { TaskUpdateRepository } from "@infrastructure/repositories/task-update.repository";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SuperuserGuard } from "../auth/superuser.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserService } from "./user.service";

/**
 * Controller para rotas /user/{userId} (singular)
 * Compatível com o path esperado pelo openapi.yaml
 */
@ApiTags("user")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("user")
export class UserSingularController {
  private readonly logger = new Logger(UserSingularController.name);

  constructor(
    private readonly userService: UserService,
    private readonly taskRepository: TaskRepository,
    private readonly gameRepository: GameRepository,
    @Inject("TaskUpdateRepository")
    private readonly taskUpdateRepository: TaskUpdateRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const result = await this.userService.create(createUserDto);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(":userId")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("userId") userId: string): Promise<UserResponseDto> {
    try {
      const result = await this.userService.findById(userId);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put(":userId")
  @ApiOperation({ summary: "Replace user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async replace(
    @Param("userId") userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.update(userId, updateUserDto);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Patch(":userId")
  @ApiOperation({ summary: "Update user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Param("userId") userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.update(userId, updateUserDto);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(":userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 204, description: "User deleted" })
  async remove(@Param("userId") userId: string): Promise<void> {
    try {
      await this.userService.delete(userId);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // Push Token Routes (stub - precisa de infraestrutura de push tokens)
  @Put(":userId/push-token/:pushToken")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Register push token for user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "pushToken",
    example: "ExponentPushToken[xxxxxxxxxxxxx]",
  })
  @ApiResponse({ status: 200, description: "Push token registered" })
  async registerPushToken(
    @Param("userId") userId: string,
    @Param("pushToken") pushToken: string,
  ): Promise<{ message: string }> {
    // TODO: Implementar persistência real quando a tabela existir
    this.logger.log(
      `Push token registered for user ${userId}: ${pushToken.substring(0, 20)}...`,
    );
    return { message: "Push token registered successfully" };
  }

  @Delete(":userId/push-token/:pushToken")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove push token for user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "pushToken",
    example: "ExponentPushToken[xxxxxxxxxxxxx]",
  })
  @ApiResponse({ status: 200, description: "Push token removed" })
  async removePushToken(
    @Param("userId") userId: string,
    @Param("pushToken") pushToken: string,
  ): Promise<{ message: string }> {
    // TODO: Implementar persistência real quando a tabela existir
    this.logger.log(
      `Push token removed for user ${userId}: ${pushToken.substring(0, 20)}...`,
    );
    return { message: "Push token removed successfully" };
  }

  // User Tasks by Game
  @Get(":userId/game/:gameId/task")
  @ApiOperation({ summary: "List user tasks for a given game" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "gameId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "startDateBefore",
    required: false,
    description: "Filter tasks with start date before (inclusive)",
    example: "2023-12-31",
  })
  @ApiQuery({
    name: "endDateAfter",
    required: false,
    description: "Filter tasks with end date after (inclusive)",
    example: "2023-01-01",
  })
  @ApiResponse({ status: 200, description: "List of user tasks" })
  async listUserTasksForGame(
    @Param("userId") userId: string,
    @Param("gameId") gameId: string,
    @Query("startDateBefore") startDateBefore?: string,
    @Query("endDateAfter") endDateAfter?: string,
  ): Promise<{ items: any[] }> {
    // Busca todas as tasks do usuário
    const allUserTasks = await this.taskRepository.findByUserId(userId);

    // Filtra as tasks que pertencem ao game especificado
    let filteredTasks = allUserTasks.filter((task) => task.gameId === gameId);

    // Aplica filtros de data se fornecidos
    if (startDateBefore) {
      const beforeDate = new Date(startDateBefore);
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.startDate) return true;
        return new Date(task.startDate) <= beforeDate;
      });
    }

    if (endDateAfter) {
      const afterDate = new Date(endDateAfter);
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.endDate) return true;
        return new Date(task.endDate) >= afterDate;
      });
    }

    // Adiciona flag wasUpdatedRecently (atualizado hoje)
    const today = new Date().toISOString().split("T")[0];
    const items = filteredTasks.map((task) => ({
      ...task,
      wasUpdatedRecently: task.progress?.updatedAt
        ? task.progress.updatedAt.startsWith(today)
        : false,
    }));

    return { items };
  }

  // User Games by Organization
  @Get(":userId/organization/:organizationId/game")
  @ApiOperation({ summary: "List user games for a given organization" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, description: "List of user games" })
  async listUserGamesForOrganization(
    @Param("userId") userId: string,
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: any[] }> {
    // Busca todos os games da organização
    const orgGames =
      await this.gameRepository.findByOrganizationId(organizationId);

    // Busca tasks do usuário para saber em quais games ele participa
    const userTasks = await this.taskRepository.findByUserId(userId);
    const userGameIds = new Set(userTasks.map((task) => task.gameId));

    // Filtra games que pertencem à organização E onde o usuário tem tasks
    // Ou inclui todos os games da organização se ele for membro
    const items = orgGames.filter(
      (game) => !game.archived && userGameIds.has(game.id),
    );

    return { items };
  }

  // User Task Updates by Organization
  @Get(":userId/organization/:organizationId/task/update")
  @ApiOperation({ summary: "List task updates the user can edit" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "organizationId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["PENDING_REVIEW", "ACCEPTED", "REJECTED", "CANCELLED"],
  })
  @ApiQuery({
    name: "submittedBy",
    required: false,
    description: "Filter by submitter user ID",
  })
  @ApiQuery({
    name: "taskId",
    required: false,
    description: "Filter by task ID",
  })
  @ApiQuery({
    name: "teamId",
    required: false,
    description: "Filter by team ID",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: "List of task updates" })
  async listUserTaskUpdates(
    @Param("userId") userId: string,
    @Param("organizationId") organizationId: string,
    @Query("status") status?: string,
    @Query("submittedBy") submittedBy?: string,
    @Query("taskId") taskId?: string,
    @Query("teamId") teamId?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ): Promise<{ items: any[]; page?: number; limit?: number; total?: number }> {
    // Busca todas as task updates do usuário (submetidas por ele)
    const updates = await this.taskUpdateRepository.findBySubmitterId(
      submittedBy || userId,
    );

    // Aplica filtros
    let filteredUpdates = updates;

    if (status) {
      filteredUpdates = filteredUpdates.filter((u) => u.status === status);
    }

    if (taskId) {
      filteredUpdates = filteredUpdates.filter((u) => u.taskId === taskId);
    }

    // Paginação
    const pageNum = page || 1;
    const limitNum = limit || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedUpdates = filteredUpdates.slice(
      startIndex,
      startIndex + limitNum,
    );

    return {
      items: paginatedUpdates,
      page: pageNum,
      limit: limitNum,
      total: filteredUpdates.length,
    };
  }

  @Post(":userId/activate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Activate user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async activate(
    @Param("userId") userId: string,
    @Body() _body?: any,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.activate(userId);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(":userId/superuser")
  @UseGuards(SuperuserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Make user a superuser (superuser only)" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Only superusers can access this resource",
  })
  async makeSuperuser(
    @Param("userId") userId: string,
    @Body() _body?: any,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.makeSuperuser(userId);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get("by-email/:email")
  @ApiOperation({ summary: "Get user by email" })
  @ApiParam({ name: "email", example: "john@example.com" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findByEmail(@Param("email") email: string): Promise<UserResponseDto> {
    try {
      const result = await this.userService.findByEmail(email);
      if (!result.user) {
        throw new NotFoundException("User not found");
      }
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get("by-phone/:phone")
  @ApiOperation({ summary: "Get user by phone" })
  @ApiParam({ name: "phone", example: "+5511999999999" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findByPhone(@Param("phone") phone: string): Promise<UserResponseDto> {
    try {
      const result = await this.userService.findByPhone(phone);
      if (!result.user) {
        throw new NotFoundException("User not found");
      }
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
