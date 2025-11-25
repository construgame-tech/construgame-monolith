// Game Controller
// REST API endpoints para gerenciamento de games usando domain use-cases

import type { GameEntity } from "@domain/game";
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
// DTOs
import type { CreateGameDto } from "./dto/create-game.dto";
import { GameListResponseDto, GameResponseDto } from "./dto/game-response.dto";
import type { UpdateGameDto } from "./dto/update-game.dto";
import { GameService } from "./game.service";

@ApiTags("games")
@ApiBearerAuth("JWT-auth")
@Controller("games")
export class GameController {
  constructor(
    @Inject(GameService)
    private readonly gameService: GameService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create a new game",
    description:
      "Creates a new game/competition with prizes, KPIs, and gamification settings",
  })
  @ApiResponse({
    status: 201,
    description: "Game created successfully",
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data",
  })
  async create(@Body() createGameDto: CreateGameDto): Promise<GameResponseDto> {
    try {
      const game = await this.gameService.create(createGameDto);
      return GameResponseDto.fromEntity(game);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get game by ID",
    description: "Retrieves a specific game by its ID",
  })
  @ApiParam({
    name: "id",
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "organizationId",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Game found",
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Game not found",
  })
  async findOne(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
  ): Promise<GameResponseDto> {
    if (!organizationId) {
      throw new BadRequestException(
        "organizationId query parameter is required",
      );
    }

    const game = await this.gameService.findById(organizationId, id);
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return GameResponseDto.fromEntity(game);
  }

  @Get()
  @ApiOperation({
    summary: "List games",
    description: "Lists all games for an organization or project",
  })
  @ApiQuery({
    name: "organizationId",
    description: "Organization ID",
    required: true,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "projectId",
    description: "Project ID (optional - filters by project if provided)",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Games list retrieved successfully",
    type: GameListResponseDto,
  })
  async findByOrganization(
    @Query("organizationId") organizationId: string,
    @Query("projectId") projectId?: string,
  ): Promise<GameListResponseDto> {
    if (!organizationId) {
      throw new BadRequestException(
        "organizationId query parameter is required",
      );
    }

    let games: GameEntity[];
    if (projectId) {
      games = await this.gameService.listByProject(organizationId, projectId);
    } else {
      games = await this.gameService.listByOrganization(organizationId);
    }

    return GameListResponseDto.fromEntities(games);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Update game",
    description: "Updates an existing game",
  })
  @ApiParam({
    name: "id",
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "organizationId",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Game updated successfully",
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Game not found",
  })
  async update(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
    @Body() updateGameDto: UpdateGameDto,
  ): Promise<GameResponseDto> {
    if (!organizationId) {
      throw new BadRequestException(
        "organizationId query parameter is required",
      );
    }

    try {
      const game = await this.gameService.update(
        organizationId,
        id,
        updateGameDto,
      );
      return GameResponseDto.fromEntity(game);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete game",
    description: "Permanently deletes a game",
  })
  @ApiParam({
    name: "id",
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "organizationId",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 204,
    description: "Game deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Game not found",
  })
  async remove(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
  ): Promise<void> {
    if (!organizationId) {
      throw new BadRequestException(
        "organizationId query parameter is required",
      );
    }

    try {
      await this.gameService.remove(organizationId, id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(":id/archive")
  @ApiOperation({
    summary: "Archive game",
    description: "Archives a game (soft delete)",
  })
  @ApiParam({
    name: "id",
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "organizationId",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Game archived successfully",
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Game not found",
  })
  async archive(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
  ): Promise<GameResponseDto> {
    if (!organizationId) {
      throw new BadRequestException(
        "organizationId query parameter is required",
      );
    }

    try {
      const game = await this.gameService.archive(organizationId, id);
      return GameResponseDto.fromEntity(game);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post(":id/unarchive")
  @ApiOperation({
    summary: "Unarchive game",
    description: "Restores an archived game",
  })
  @ApiParam({
    name: "id",
    description: "Game ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "organizationId",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Game unarchived successfully",
    type: GameResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Game not found",
  })
  async unarchive(
    @Param("id") id: string,
    @Query("organizationId") organizationId: string,
  ): Promise<GameResponseDto> {
    if (!organizationId) {
      throw new BadRequestException(
        "organizationId query parameter is required",
      );
    }

    try {
      const game = await this.gameService.unarchive(organizationId, id);
      return GameResponseDto.fromEntity(game);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
