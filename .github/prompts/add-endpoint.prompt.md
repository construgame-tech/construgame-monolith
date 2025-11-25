---
agent: agent
description: 'Add new REST API endpoint following Clean Architecture'
---

# Add New REST API Endpoint

You are creating a new REST API endpoint for the Construgame monolith. Follow this exact workflow:

## Step 1: Domain Layer (Pure Business Logic)

### 1.1 Create or update entity
Location: `domain/{domain}/entities/{entity}.entity.ts`

```typescript
export type EntityName = {
  readonly id: string;
  readonly organizationId: string;
  // ... other fields
};

export const createEntity = (props: {...}): EntityName => ({
  ...props,
  // ... defaults
});
```

### 1.2 Create or update repository interface
Location: `domain/{domain}/repositories/{entity}.repository.interface.ts`

```typescript
export interface IEntityRepository {
  save(entity: EntityName): Promise<void>;
  findById(organizationId: string, id: string): Promise<EntityName | null>;
  // ... other methods
}
```

### 1.3 Create use case
Location: `domain/{domain}/use-cases/{action}-{entity}.ts`

```typescript
export interface ActionEntityInput {
  readonly organizationId: string;
  // ... other inputs
}

export interface ActionEntityOutput {
  readonly entity: EntityName;
}

export const actionEntity = async (
  input: ActionEntityInput,
  repository: IEntityRepository,
): Promise<ActionEntityOutput> => {
  // Pure business logic here
  return { entity };
};
```

## Step 2: Infrastructure Layer

### 2.1 Create or update database schema
Location: `src/infrastructure/database/schemas/{domain}.schema.ts`

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const tableName = pgTable('table_name', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  // ... other columns
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.2 Generate and run migration
```bash
npm run db:generate
npm run db:migrate
```

### 2.3 Create or update repository implementation
Location: `src/infrastructure/repositories/{entity}.repository.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { IEntityRepository, EntityName } from '@domain/{domain}';
import { DRIZZLE_CONNECTION, type DrizzleDB } from '../database/drizzle.provider';
import { tableName } from '../database/schemas/{domain}.schema';

@Injectable()
export class EntityRepository implements IEntityRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}

  async save(entity: EntityName): Promise<void> {
    await this.db.insert(tableName).values({
      // map entity to table columns
    }).onConflictDoUpdate({
      target: tableName.id,
      set: { /* updates */ },
    });
  }

  async findById(organizationId: string, id: string): Promise<EntityName | null> {
    const result = await this.db
      .select()
      .from(tableName)
      .where(and(eq(tableName.id, id), eq(tableName.organizationId, organizationId)))
      .limit(1);

    return result.length ? this.mapToEntity(result[0]) : null;
  }

  private mapToEntity(row: typeof tableName.$inferSelect): EntityName {
    return {
      // map DB row to domain entity
    };
  }
}
```

## Step 3: Application Layer

### 3.1 Create DTOs
Location: `src/modules/{domain}/dto/`

**create-{entity}.dto.ts:**
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateEntityDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  @MinLength(3)
  name: string;

  // ... other fields
}
```

**{entity}-response.dto.ts:**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import type { EntityName } from '@domain/{domain}';

export class EntityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  // ... other fields

  static fromEntity(entity: EntityName): EntityResponseDto {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      // ... map all fields
    };
  }
}
```

### 3.2 Create or update service
Location: `src/modules/{domain}/{domain}.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { actionEntity, type IEntityRepository } from '@domain/{domain}';
import { EntityRepository } from '@infrastructure/repositories/{entity}.repository';
import type { CreateEntityDto } from './dto/create-{entity}.dto';

@Injectable()
export class EntityService {
  constructor(private readonly entityRepository: EntityRepository) {}

  async create(dto: CreateEntityDto) {
    const result = await actionEntity(
      {
        organizationId: dto.organizationId,
        name: dto.name,
      },
      this.entityRepository,
    );

    return result.entity;
  }
}
```

### 3.3 Create or update controller
Location: `src/modules/{domain}/{domain}.controller.ts`

```typescript
import { Controller, Post, Get, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EntityService } from './{domain}.service';
import { CreateEntityDto } from './dto/create-{entity}.dto';
import { EntityResponseDto } from './dto/{entity}-response.dto';

@ApiTags('{domain}')
@Controller('{domain}')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Post()
  @ApiOperation({ summary: 'Create {entity}' })
  @ApiResponse({ status: 201, description: '{Entity} created', type: EntityResponseDto })
  async create(@Body() dto: CreateEntityDto): Promise<EntityResponseDto> {
    const entity = await this.entityService.create(dto);
    return EntityResponseDto.fromEntity(entity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {entity} by ID' })
  async findOne(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ): Promise<EntityResponseDto> {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    const entity = await this.entityService.findById(organizationId, id);
    
    if (!entity) {
      throw new NotFoundException(`{Entity} with ID ${id} not found`);
    }

    return EntityResponseDto.fromEntity(entity);
  }
}
```

### 3.4 Create or update module
Location: `src/modules/{domain}/{domain}.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { EntityController } from './{domain}.controller';
import { EntityService } from './{domain}.service';
import { EntityRepository } from '@infrastructure/repositories/{entity}.repository';

@Module({
  controllers: [EntityController],
  providers: [EntityService, EntityRepository],
  exports: [EntityService, EntityRepository],
})
export class EntityModule {}
```

### 3.5 Register module in app.module.ts
Add to imports array in `src/app.module.ts`:
```typescript
imports: [
  // ... other modules
  EntityModule,
],
```

### 3.6 Add Swagger tag in main.ts
Add to DocumentBuilder in `src/main.ts`:
```typescript
.addTag('{domain}', '{Entity} management endpoints')
```

## Step 4: Create Tests

### 4.1 Domain use case test
Location: `domain/{domain}/use-cases/{action}-{entity}.spec.ts`

```typescript
import { actionEntity } from './{action}-{entity}';
import type { IEntityRepository } from '../repositories/{entity}.repository.interface';
import { describe, it, expect, vi } from 'vitest';

describe('actionEntity use case', () => {
  it('should action entity successfully', async () => {
    const mockRepository: IEntityRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };

    const result = await actionEntity(
      { organizationId: 'org-1', name: 'Test' },
      mockRepository
    );

    expect(result.entity).toHaveProperty('id');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

### 4.2 Service test
Location: `src/modules/{domain}/{domain}.service.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { EntityService } from './{domain}.service';
import { EntityRepository } from '@infrastructure/repositories/{entity}.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EntityService', () => {
  let service: EntityService;
  let repository: EntityRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: EntityRepository,
          useValue: {
            save: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(EntityService);
    repository = module.get(EntityRepository);
  });

  it('should create entity', async () => {
    vi.spyOn(repository, 'save').mockResolvedValue(undefined);

    const result = await service.create({
      organizationId: 'org-1',
      name: 'Test',
    });

    expect(result).toHaveProperty('id');
  });
});
```

### 4.3 E2E test
Location: `test/modules/{domain}/{domain}.e2e-spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@modules/app.module';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('EntityController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EntityRepository)
      .useValue({
        save: vi.fn(),
        findById: vi.fn().mockResolvedValue(mockEntity),
      })
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/{domain} should create entity', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/{domain}',
      payload: { organizationId: 'org-1', name: 'Test' },
    });

    expect(response.statusCode).toBe(201);
  });
});
```

## Step 5: Verification

- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Start dev server: `npm run start:dev`
- [ ] Test endpoint in Swagger: `http://localhost:3000/docs`
- [ ] Verify endpoint at: `http://localhost:3000/api/v1/{domain}`

## Ask User For

If not provided in the request, ask the user:
1. Domain name (e.g., "game", "task", "user")
2. Entity name (e.g., "Game", "Task", "User")
3. Required fields and their types
4. Optional fields
5. HTTP method (POST, GET, PUT, DELETE)
6. Endpoint path

## Important Notes

- **Follow Clean Architecture** - domain → infrastructure → application
- **Pure functions in domain** - no classes, no side effects
- **Use path aliases** - `@domain/*`, `@infrastructure/*`, `@modules/*`
- **TypeScript strict** - explicit return types, no `any`
- **Test at all layers** - domain, service, controller, E2E
- **Validate DTOs** - use class-validator decorators
- **Document API** - use Swagger decorators
