---
applyTo: "src/modules/**/*.ts,src/infrastructure/**/*.ts"
---

# NestJS Application & Infrastructure Guidelines

**Critical**: NestJS is an **Object-Oriented framework**. Use classes, decorators, and dependency injection. Follow **SOLID principles**.

## SOLID Principles for NestJS

### Single Responsibility Principle
Each class should have one, and only one, reason to change.

```typescript
// ✅ Correct - GameService only orchestrates game operations
@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}
  
  async create(dto: CreateGameDto): Promise<GameEntity> {
    return await createGame(dto, this.gameRepository);
  }
}

// ✅ Correct - GameRepository only handles database operations
@Injectable()
export class GameRepository implements IGameRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}
  
  async save(game: GameEntity): Promise<void> {
    await this.db.insert(games).values(game).onConflictDoUpdate({...});
  }
}

// ❌ Wrong - Service doing database work directly
@Injectable()
export class GameService {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}
  
  async create(dto: CreateGameDto) {
    await this.db.insert(games).values(dto); // Violates SRP!
  }
}
```

### Open/Closed Principle
Classes should be open for extension but closed for modification.

```typescript
// ✅ Correct - Use interfaces to extend behavior
interface INotificationSender {
  send(message: string): Promise<void>;
}

@Injectable()
export class EmailNotificationSender implements INotificationSender {
  async send(message: string): Promise<void> { /* email logic */ }
}

@Injectable()
export class SmsNotificationSender implements INotificationSender {
  async send(message: string): Promise<void> { /* SMS logic */ }
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('EMAIL_SENDER') private readonly emailSender: INotificationSender,
    @Inject('SMS_SENDER') private readonly smsSender: INotificationSender,
  ) {}
  
  async notifyAll(message: string): Promise<void> {
    await Promise.all([
      this.emailSender.send(message),
      this.smsSender.send(message),
    ]);
  }
}
```

### Liskov Substitution Principle
Subclasses should be substitutable for their base classes.

```typescript
// ✅ Correct - All implementations fulfill IGameRepository contract
interface IGameRepository {
  save(game: GameEntity): Promise<void>;
  findById(id: string): Promise<GameEntity | null>;
}

@Injectable()
export class DrizzleGameRepository implements IGameRepository {
  async save(game: GameEntity): Promise<void> { /* Drizzle logic */ }
  async findById(id: string): Promise<GameEntity | null> { /* Drizzle logic */ }
}

@Injectable()
export class InMemoryGameRepository implements IGameRepository {
  async save(game: GameEntity): Promise<void> { /* In-memory logic */ }
  async findById(id: string): Promise<GameEntity | null> { /* In-memory logic */ }
}

// Either can be injected into GameService without issues
```

### Interface Segregation Principle
Clients should not be forced to depend on interfaces they don't use.

```typescript
// ✅ Correct - Split large interfaces into smaller ones
interface IReadOnlyGameRepository {
  findById(id: string): Promise<GameEntity | null>;
  findByOrganizationId(orgId: string): Promise<GameEntity[]>;
}

interface IWriteOnlyGameRepository {
  save(game: GameEntity): Promise<void>;
  delete(id: string): Promise<void>;
}

// Full repository combines both
interface IGameRepository extends IReadOnlyGameRepository, IWriteOnlyGameRepository {}

// Services can depend only on what they need
@Injectable()
export class GameQueryService {
  constructor(private readonly repository: IReadOnlyGameRepository) {}
}

// ❌ Wrong - Forcing all clients to implement unused methods
interface IGameRepository {
  save(game: GameEntity): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<GameEntity | null>;
  bulkInsert(games: GameEntity[]): Promise<void>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  // Too many methods! Split it.
}
```

### Dependency Inversion Principle
Depend on abstractions, not concretions.

```typescript
// ✅ Correct - Service depends on interface (abstraction)
@Injectable()
export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}
}

// ✅ Correct - Register interface binding in module
@Module({
  providers: [
    GameService,
    {
      provide: 'IGameRepository',
      useClass: DrizzleGameRepository,
    },
  ],
})
export class GameModule {}

// ❌ Wrong - Service depends on concrete implementation
@Injectable()
export class GameService {
  constructor(private readonly db: DrizzleDB) {}  // Tight coupling!
}
```

## Module Structure
```
src/modules/{domain}/
├── {domain}.module.ts
├── {domain}.controller.ts
├── {domain}.service.ts
└── dto/
    ├── create-{domain}.dto.ts
    ├── update-{domain}.dto.ts
    └── {domain}-response.dto.ts
```

## Module Registration Pattern
```typescript
// ✅ Correct module pattern
import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameRepository } from '@infrastructure/repositories/game.repository';

@Module({
  controllers: [GameController],
  providers: [GameService, GameRepository],
  exports: [GameService, GameRepository],  // Export for other modules
})
export class GameModule {}
```

## Controller Pattern
```typescript
// ✅ Correct controller pattern
import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';

@ApiTags('games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiOperation({ summary: 'Create game' })
  @ApiResponse({ status: 201, description: 'Game created' })
  async create(@Body() dto: CreateGameDto) {
    return await this.gameService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  async findOne(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }
    return await this.gameService.findById(organizationId, id);
  }
}
```

## Service Pattern
```typescript
// ✅ Correct service pattern - calls domain use cases
import { Injectable, NotFoundException } from '@nestjs/common';
import { createGame, updateGame, type IGameRepository } from '@domain/game';
import { GameRepository } from '@infrastructure/repositories/game.repository';
import type { CreateGameDto } from './dto/create-game.dto';

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  async create(dto: CreateGameDto) {
    const result = await createGame(
      {
        organizationId: dto.organizationId,
        projectId: dto.projectId,
        name: dto.name,
      },
      this.gameRepository,
    );

    return result.game;
  }

  async findById(organizationId: string, gameId: string) {
    const game = await this.gameRepository.findById(organizationId, gameId);
    
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    return game;
  }
}

// ❌ Wrong - business logic in service
@Injectable()
export class GameService {
  async create(dto: CreateGameDto) {
    const game = {  // Business logic should be in domain!
      id: randomUUID(),
      ...dto,
      status: 'ACTIVE',
    };
    await this.gameRepository.save(game);
    return game;
  }
}
```

## DTO Pattern with Validation
```typescript
// ✅ Correct DTO with class-validator
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, MinLength, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGameDto {
  @ApiProperty({ description: 'Organization ID', example: 'uuid-here' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Project ID' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'Game name' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Prizes array' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GamePrizeDto)
  prizes?: GamePrizeDto[];
}

// ❌ Wrong - no validation decorators
export class CreateGameDto {
  organizationId: string;
  name: string;
}
```

## Repository Implementation Pattern
```typescript
// ✅ Correct repository implementation
import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { IGameRepository, GameEntity } from '@domain/game';
import { DRIZZLE_CONNECTION, type DrizzleDB } from '../database/drizzle.provider';
import { games } from '../database/schemas/game.schema';

@Injectable()
export class GameRepository implements IGameRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(game: GameEntity): Promise<void> {
    await this.db.insert(games).values({
      id: game.id,
      organizationId: game.organizationId,
      name: game.name,
      status: game.status,
      archived: game.archived ? 1 : 0,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: games.id,
      set: { name: game.name, updatedAt: new Date() },
    });
  }

  async findById(organizationId: string, gameId: string): Promise<GameEntity | null> {
    const result = await this.db
      .select()
      .from(games)
      .where(and(eq(games.id, gameId), eq(games.organizationId, organizationId)))
      .limit(1);

    if (!result.length) return null;

    return this.mapToEntity(result[0]);
  }

  private mapToEntity(row: typeof games.$inferSelect): GameEntity {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      status: row.status,
      archived: row.archived === 1,
    };
  }
}
```

## Error Handling
```typescript
// ✅ Use NestJS exceptions
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';

throw new NotFoundException(`Game with ID ${id} not found`);
throw new BadRequestException('Invalid organizationId');
throw new UnauthorizedException('Access denied');

// Global HttpExceptionFilter handles formatting automatically
```

## Dependency Injection
```typescript
// ✅ Constructor injection
@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
  ) {}
}

// ❌ Don't use @Inject unless needed
@Injectable()
export class GameService {
  constructor(
    @Inject('GAME_REPOSITORY') private readonly gameRepository: GameRepository,
  ) {}
}
```

## Fastify Specific
```typescript
// ✅ Use Fastify types
import type { FastifyRequest, FastifyReply } from 'fastify';

@Get()
async handler(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
  // implementation
}

// ❌ Don't use Express types
import type { Request, Response } from 'express';
```

## Global Configuration
- **ValidationPipe**: Applied globally in `main.ts`
- **HttpExceptionFilter**: Applied globally in `main.ts`
- **TransformInterceptor**: Applied globally in `main.ts`
- **Rate Limiting**: Configured in `app.module.ts`

Controllers/services don't need to apply these - they're automatic.
