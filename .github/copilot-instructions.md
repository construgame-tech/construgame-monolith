# Construgame Monolith - AI Coding Instructions

## Architecture Overview

This is a **NestJS monolith** with **Clean Architecture** + **DDD**, migrated from microservices. Three-layer structure:

1. **Domain Layer** (`domain/`): Pure business logic, functional programming style, framework-agnostic
2. **Infrastructure Layer** (`src/infrastructure/`): Drizzle ORM repositories, AWS services (S3, SES, SNS), database schemas
3. **Application Layer** (`src/modules/`): NestJS controllers, services, DTOs with validation

### Key Architectural Principles

- **Dependency Flow**: Controllers → Services → Domain Use Cases → Repository Interfaces → Repository Implementations
- **Functional Domain**: No classes in `domain/`, only pure functions and types. Use cases are exported functions like `createGame()`, `updateTask()`
- **Repository Pattern**: Domain defines interfaces (`IGameRepository`), infrastructure implements them (`GameRepository extends IGameRepository`)
- **DTO Validation**: Use `class-validator` decorators in DTOs, validated automatically via global `ValidationPipe`

## Domain Structure (25+ domains)

Each domain follows this exact pattern:
```
domain/{domain-name}/
├── entities/           # Types + factory functions (e.g., GameEntity, createGameEntity())
├── repositories/       # Repository interfaces (e.g., IGameRepository)
└── use-cases/          # Pure functions (e.g., create-game.ts exports createGame())
```

**Core domains**: `game`, `task`, `task-update`, `kaizen`, `project`, `user`, `organization`, `team`, `member`
**Supporting**: `notification`, `image`, `league`, `kpi`, `kaizen-type`, `job-role`, `organization-config`, `task-manager`, `task-template`, `project-diary`, `project-planning`

## Critical Development Patterns

### 1. Creating New Features (Example: Adding endpoint)

**Step 1**: Create/update domain use case in `domain/{domain}/use-cases/{action}.ts`:
```typescript
export interface CreateGameInput { organizationId: string; name: string; }
export interface CreateGameOutput { game: GameEntity; }

export const createGame = async (
  input: CreateGameInput,
  repository: IGameRepository,
): Promise<CreateGameOutput> => {
  const game = createGameEntity({ id: randomUUID(), ...input });
  await repository.save(game);
  return { game };
};
```

**Step 2**: Implement repository in `src/infrastructure/repositories/`:
```typescript
@Injectable()
export class GameRepository implements IGameRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}
  
  async save(game: GameEntity): Promise<void> {
    await this.db.insert(games).values(game).onConflictDoUpdate({ ... });
  }
}
```

**Step 3**: Create service in `src/modules/{domain}/{domain}.service.ts`:
```typescript
@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}
  
  async create(dto: CreateGameDto) {
    return await createGame(dto, this.gameRepository);
  }
}
```

**Step 4**: Create controller in `src/modules/{domain}/{domain}.controller.ts`:
```typescript
@Controller('games')
@ApiTags('games')
export class GameController {
  @Post()
  @ApiOperation({ summary: 'Create game' })
  async create(@Body() dto: CreateGameDto) {
    return await this.gameService.create(dto);
  }
}
```

### 2. Database Changes with Drizzle

Schemas live in `src/infrastructure/database/schemas/{domain}.schema.ts`:
```typescript
export const games = pgTable('games', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  prizes: jsonb('prizes').$type<GamePrize[]>(),
  archived: integer('archived').$type<0 | 1>().default(0), // Boolean as 0/1
});
```

**Migration workflow**:
```bash
npm run db:generate   # Generates SQL migration from schema changes
npm run db:migrate    # Applies migrations to database
npm run db:studio     # Opens Drizzle Studio UI
```

### 3. Path Aliases (configured in `tsconfig.json`)

Always use these imports:
- `@domain/*` → `domain/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@modules/*` → `src/modules/*`
- `@common/*` → `src/common/*`

Example: `import { createGame, IGameRepository } from '@domain/game';`

### 4. Testing with Vitest

Tests use Vitest (not Jest). Run commands:
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
npm run test:cov      # Coverage
```

E2E tests in `test/modules/{domain}/{domain}.e2e-spec.ts` use `vitest` + `supertest`:
```typescript
describe('GameController (e2e)', () => {
  it('should create game', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/games')
      .send(createGameDto)
      .expect(201);
  });
});
```

## Development Workflow

### Local Setup
```bash
cp .env.monolith.example .env
pnpm install
docker-compose -f docker-compose-monolith.yml up -d postgres
npm run db:migrate
npm run start:dev
```

### Key Commands
- `npm run start:dev` - Development with hot reload
- `npm run build` - Production build
- `npm run format` - Format with Biome (configured in `biome.json`)

### Terminal Commands - CRITICAL RULES

**NEVER run commands that produce paginated output without disabling pagination:**
- ❌ `psql -c "\d table"` (paginates with `less`)
- ✅ `psql -c "\d table" | cat` (pipe to cat to disable pager)
- ✅ `PAGER=cat psql -c "\d table"` (set PAGER env var)

- ❌ `git log` (paginates)
- ✅ `git --no-pager log` (disable pager)

- ❌ `less file.txt` (paginates)
- ✅ `cat file.txt` (no pagination)

**Always use flags/pipes to prevent paging:**
```bash
# PostgreSQL
PAGER=cat psql -h localhost -U user -d db -c "SELECT * FROM table;"

# Git
git --no-pager log --oneline -20
git --no-pager diff

# General
command | cat  # Pipe to cat disables most pagers
command | head -100  # Limit output
```

**Database changes must use Drizzle migrations:**
- ❌ Never run raw SQL ALTER TABLE manually
- ✅ Update schema in `src/infrastructure/database/schemas/`
- ✅ Run `pnpm db:generate` to create migration
- ✅ Run `pnpm db:migrate` to apply

If migration fails due to existing data, fix the schema to handle it (e.g., make columns nullable, add defaults) rather than running manual SQL.

### API Documentation
- Swagger: `http://localhost:3000/docs`
- Base URL: `http://localhost:3000/api/v1`
- Health check: `http://localhost:3000/api/v1/health`

## Code Conventions

### Language & Comments
- **Code in English**: All variables, functions, types
- **Comments in Portuguese**: Documentation and inline comments

### DTOs & Validation
Create DTOs in `src/modules/{domain}/dto/`:
```typescript
export class CreateGameDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Game name' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ description: 'Prizes array' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GamePrizeDto)
  prizes?: GamePrizeDto[];
}
```

### NestJS Module Registration
Always register repositories in module providers:
```typescript
@Module({
  controllers: [GameController],
  providers: [GameService, GameRepository],
  exports: [GameService, GameRepository],
})
export class GameModule {}
```

### Error Handling
Global `HttpExceptionFilter` formats all errors. Use NestJS exceptions:
```typescript
throw new NotFoundException(`Game with ID ${id} not found`);
throw new BadRequestException('Invalid organizationId');
```

### Fastify Adapter
This project uses **Fastify** (not Express). Request/response types:
```typescript
import type { FastifyRequest, FastifyReply } from 'fastify';
```

## Infrastructure Services

### Database (Drizzle ORM)
Connection: `@Inject(DRIZZLE_CONNECTION) private db: DrizzleDB`
Query example: `await this.db.select().from(games).where(eq(games.id, id));`

### AWS Services
- **S3**: Image storage via `StorageModule` (`@infrastructure/services/storage`)
- **SES**: Email via `EmailModule` (`@infrastructure/services/email`)
- **SNS**: Push notifications via `PushNotificationModule` (`@infrastructure/services/notification`)

### Rate Limiting
Configured in `app.module.ts` with `@nestjs/throttler`:
- Short: 10 req/1s
- Medium: 50 req/10s
- Long: 200 req/60s

## Common Gotchas

1. **Boolean storage**: PostgreSQL booleans stored as `integer` 0/1 in schema (e.g., `archived: integer("archived").$type<0 | 1>()`)
2. **UUID validation**: Always use `@IsUUID()` for ID fields
3. **Query parameters**: Controllers must manually validate required query params (e.g., `organizationId`)
4. **JSONB types**: Use `$type<T>()` in schema for type safety: `jsonb("data").$type<MyType[]>()`
5. **Module imports**: Feature modules must be registered in `app.module.ts` imports array
6. **Global filters**: `HttpExceptionFilter` and `TransformInterceptor` are globally applied in `main.ts`

## When Adding New Domains

1. Create domain structure: `domain/{new-domain}/{entities,repositories,use-cases}/`
2. Create schema: `src/infrastructure/database/schemas/{new-domain}.schema.ts`
3. Generate migration: `npm run db:generate`
4. Create repository: `src/infrastructure/repositories/{new-domain}.repository.ts`
5. Create module: `src/modules/{new-domain}/` with controller, service, DTOs
6. Register in `app.module.ts` imports
7. Add Swagger tags in `main.ts` DocumentBuilder
8. Create E2E tests: `test/modules/{new-domain}/{new-domain}.e2e-spec.ts`

---

## Testing with NestJS + Vitest

### Quick Reference

| Task | Command/File | Notes |
|------|--------------|-------|
| Run all tests | `npm test` | Uses Vitest |
| Watch mode | `npm run test:watch` | Auto-reruns on changes |
| Coverage | `npm run test:cov` | Target: 80%+ |
| UI mode | `npm run test:ui` | Visual test runner |
| Unit tests | `*.spec.ts` | Next to source file |
| E2E tests | `test/modules/{domain}/*.e2e-spec.ts` | Separate directory |
| Test setup | `test/setup.ts` | Global config |

**CRITICAL**: This project uses **Vitest** (not Jest). Always import from `vitest`, never from `@jest/globals`.

---

### Test File Structure

```
src/modules/game/
├── game.controller.ts
├── game.controller.spec.ts    ← Unit test
├── game.service.ts
└── game.service.spec.ts        ← Unit test

test/modules/game/
└── game.e2e-spec.ts            ← E2E test

domain/game/use-cases/
└── create-game.spec.ts         ← Domain test
```

**Rules:**
- Unit tests: Same directory as source (`*.spec.ts`)
- E2E tests: `test/modules/{domain}/` (`*.e2e-spec.ts`)
- Domain tests: Next to use case functions

---

### Unit Testing Patterns

#### Pattern 1: Test.createTestingModule() (Default for NestJS)

**When to use:**
- Testing controllers with injected services
- Testing services with injected repositories
- Need to mock providers/repositories
- Testing guards, interceptors, pipes, filters

**Template:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { GameRepository } from '@infrastructure/repositories/game.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GameService', () => {
  let service: GameService;
  let repository: GameRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: GameRepository,
          useValue: {
            save: vi.fn(),
            findById: vi.fn(),
            findByOrganizationId: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    repository = module.get<GameRepository>(GameRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a game successfully', async () => {
      const dto = {
        organizationId: 'org-123',
        projectId: 'proj-123',
        name: 'Test Game',
      };

      vi.spyOn(repository, 'save').mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Game');
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Game' })
      );
    });

    it('should throw error if repository fails', async () => {
      const dto = { organizationId: 'org-123', projectId: 'proj-123', name: 'Game' };
      vi.spyOn(repository, 'save').mockRejectedValue(new Error('DB error'));

      await expect(service.create(dto)).rejects.toThrow('DB error');
    });
  });
});
```

**Key Points:**
- ALWAYS await `compile()`
- Use `module.get<Type>(Token)` for type safety
- Mock ALL repository methods used in test
- Use `vi.spyOn()` to track calls and mock return values
- Test both success and error cases

---

#### Pattern 2: Auto-Mocking with useMocker()

**When to use:**
- Controller has many injected services
- Don't want to manually create all mocks
- Testing with minimal setup

**Template:**
```typescript
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { describe, it, beforeEach, expect, vi } from 'vitest';

const moduleMocker = new ModuleMocker(global);

describe('GameController', () => {
  let controller: GameController;
  let service: GameService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GameController],
    })
      .useMocker((token) => {
        // Specific mock for known services
        if (token === GameService) {
          return {
            create: vi.fn().mockResolvedValue({ id: 'game-123', name: 'Game' }),
            findById: vi.fn().mockResolvedValue({ id: 'game-123' }),
            findByOrganizationId: vi.fn().mockResolvedValue([]),
            update: vi.fn().mockResolvedValue({ id: 'game-123' }),
            delete: vi.fn().mockResolvedValue(undefined),
          };
        }
        
        // Generic mock for other dependencies
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(GameController);
    service = moduleRef.get(GameService);
  });

  it('should create game', async () => {
    const dto = { organizationId: 'org-123', projectId: 'proj-123', name: 'Game' };
    const result = await controller.create(dto);

    expect(result).toHaveProperty('id');
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
```

**When NOT to use:**
- Need precise control over mock behavior
- Testing complex service interactions
- Mocking is simple (prefer Pattern 1)

---

#### Pattern 3: Isolated Testing (Domain Use Cases)

**When to use:**
- Testing pure functions in `domain/`
- No NestJS decorators or DI
- Testing business logic in isolation

**Template:**
```typescript
import { createGame } from './create-game';
import type { IGameRepository } from '../repositories/game.repository.interface';
import { describe, it, expect, vi } from 'vitest';

describe('createGame use case', () => {
  it('should create game entity with generated ID', async () => {
    const mockRepository: IGameRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      findByProjectId: vi.fn(),
      delete: vi.fn(),
    };

    const input = {
      organizationId: 'org-123',
      projectId: 'proj-123',
      name: 'New Game',
    };

    const result = await createGame(input, mockRepository);

    expect(result.game).toHaveProperty('id');
    expect(result.game.name).toBe('New Game');
    expect(result.game.status).toBe('ACTIVE'); // Default status
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should set custom properties when provided', async () => {
    const mockRepository: IGameRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      findByProjectId: vi.fn(),
      delete: vi.fn(),
    };

    const input = {
      organizationId: 'org-123',
      projectId: 'proj-123',
      name: 'Game',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    };

    const result = await createGame(input, mockRepository);

    expect(result.game.startDate).toBe('2025-01-01');
    expect(result.game.endDate).toBe('2025-12-31');
  });
});
```

**Best Practices:**
- Test pure business logic only
- No framework dependencies
- Fast and focused
- Test all edge cases

---

### E2E Testing (API Endpoints)

**CRITICAL for Fastify:**
- Use `FastifyAdapter` (not Express)
- Call `await app.getHttpAdapter().getInstance().ready()` after `app.init()`
- Use `app.inject()` instead of `supertest`

**Template:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@modules/app.module';
import { GameRepository } from '@infrastructure/repositories/game.repository';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('GameController (e2e)', () => {
  let app: NestFastifyApplication;
  let gameRepository: GameRepository;

  // Mock data
  const mockGame = {
    id: 'game-123',
    organizationId: 'org-123',
    projectId: 'proj-123',
    name: 'Test Game',
    status: 'ACTIVE' as const,
    sequence: 1,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GameRepository)
      .useValue({
        save: vi.fn().mockResolvedValue(undefined),
        findById: vi.fn().mockResolvedValue(mockGame),
        findByOrganizationId: vi.fn().mockResolvedValue([mockGame]),
        findByProjectId: vi.fn().mockResolvedValue([mockGame]),
        delete: vi.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    // Apply global configurations (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.setGlobalPrefix('api/v1');

    await app.init();
    await app.getHttpAdapter().getInstance().ready(); // CRITICAL for Fastify
    
    gameRepository = moduleFixture.get<GameRepository>(GameRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/games', () => {
    it('should create game with valid data', async () => {
      const createDto = {
        organizationId: 'org-123',
        projectId: 'proj-123',
        name: 'New Game',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/games',
        payload: createDto,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('New Game');
      expect(gameRepository.save).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/games',
        payload: { name: 'Incomplete' },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.message).toContain('organizationId');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/games',
        payload: {
          organizationId: 'invalid-uuid',
          projectId: 'proj-123',
          name: 'Game',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/games/:id', () => {
    it('should return game by id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/games/game-123?organizationId=org-123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.id).toBe('game-123');
      expect(gameRepository.findById).toHaveBeenCalledWith('org-123', 'game-123');
    });

    it('should return 404 when game not found', async () => {
      vi.spyOn(gameRepository, 'findById').mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/games/nonexistent?organizationId=org-123',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 when organizationId missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/games/game-123',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/games', () => {
    it('should list games for organization', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/games?organizationId=org-123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
    });
  });
});
```

**Must Override:**
- Database repositories (avoid real DB calls)
- AWS services (S3, SES, SNS)
- External APIs
- Email/SMS services

---

### Overriding Providers

#### Regular Providers
```typescript
const module = await Test.createTestingModule({
  imports: [GameModule],
})
  .overrideProvider(GameRepository)
  .useValue(mockRepository)
  .compile();

// Alternatives:
.overrideProvider(GameRepository).useClass(MockGameRepository)
.overrideProvider(GameRepository).useFactory({ factory: () => mockRepository })
```

#### Globally Registered Enhancers (Guards/Interceptors)

**CRITICAL STEP 1**: Change module registration from `useClass` to `useExisting`:

```typescript
// In auth.module.ts (BEFORE)
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,  // ❌ Can't override in tests
  },
],

// In auth.module.ts (AFTER)
providers: [
  {
    provide: APP_GUARD,
    useExisting: JwtAuthGuard,  // ✅ Can override in tests
  },
  JwtAuthGuard,  // ← Register as normal provider
],
```

**STEP 2**: Override in tests:

```typescript
const module = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useValue({
    canActivate: () => true,  // Bypass authentication
  })
  .compile();
```

#### Override Methods by Type

```typescript
// Guards
.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })

// Interceptors
.overrideInterceptor(LoggingInterceptor).useValue({ intercept: (ctx, next) => next.handle() })

// Pipes
.overridePipe(ValidationPipe).useValue({ transform: (val) => val })

// Filters
.overrideFilter(HttpExceptionFilter).useValue({ catch: () => {} })

// Modules
.overrideModule(DatabaseModule).useModule(MockDatabaseModule)
```

---

### Testing Drizzle Repositories

**Challenge**: Mock Drizzle's query builder chain

**Solution**: Mock each method in chain to return `this` or final result

```typescript
import { DRIZZLE_CONNECTION } from '@infrastructure/database/drizzle.provider';
import { GameRepository } from './game.repository';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('GameRepository', () => {
  let repository: GameRepository;
  let mockDb: any;

  beforeEach(async () => {
    // Mock Drizzle query builder chain
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue([]),
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GameRepository,
        {
          provide: DRIZZLE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<GameRepository>(GameRepository);
  });

  describe('save', () => {
    it('should insert game into database', async () => {
      const game = {
        id: 'game-123',
        organizationId: 'org-123',
        projectId: 'proj-123',
        name: 'Test Game',
        status: 'ACTIVE' as const,
        sequence: 1,
      };
      
      await repository.save(game);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'game-123',
          name: 'Test Game',
        })
      );
    });
  });

  describe('findById', () => {
    it('should return game when found', async () => {
      const mockGameRow = {
        id: 'game-123',
        organization_id: 'org-123',
        project_id: 'proj-123',
        name: 'Test',
        status: 'ACTIVE',
        sequence: 1,
        archived: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.limit.mockResolvedValue([mockGameRow]);

      const result = await repository.findById('org-123', 'game-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('game-123');
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return null when not found', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await repository.findById('org-123', 'nonexistent');

      expect(result).toBeNull();
    });
  });
});
```

**Key Points:**
- Mock EVERY method in Drizzle chain
- Use `mockReturnThis()` for chaining methods
- Use `mockResolvedValue()` for terminal methods
- Map snake_case DB columns to camelCase entities

---

### Testing Request-Scoped Providers

**Scenario**: Provider has `@Injectable({ scope: Scope.REQUEST })`

**Solution**: Use `ContextIdFactory` to create context

```typescript
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestScopedService } from './request-scoped.service';
import { describe, it, beforeEach, expect, vi } from 'vitest';

describe('RequestScopedService', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [RequestScopedService],
    }).compile();
  });

  it('should resolve request-scoped instance', async () => {
    const contextId = ContextIdFactory.create();
    vi.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const service = await moduleRef.resolve(RequestScopedService, contextId);
    
    expect(service).toBeDefined();
  });

  it('should create different instances per request', async () => {
    const contextId1 = ContextIdFactory.create();
    const contextId2 = ContextIdFactory.create();

    const service1 = await moduleRef.resolve(RequestScopedService, contextId1);
    const service2 = await moduleRef.resolve(RequestScopedService, contextId2);

    expect(service1).not.toBe(service2);
  });
});
```

---

### Common Testing Gotchas

| Issue | Wrong | Correct |
|-------|-------|---------|
| Mock function | `jest.fn()` | `vi.fn()` |
| Imports | `import { jest } from '@jest/globals'` | `import { vi } from 'vitest'` |
| Spy | `jest.spyOn()` | `vi.spyOn()` |
| Fastify ready | Missing `ready()` call | `await app.getHttpAdapter().getInstance().ready()` |
| Async compile | `Test.createTestingModule().compile()` | `await Test.createTestingModule().compile()` |
| Type safety | `module.get(GameService)` | `module.get<GameService>(GameService)` |
| Mock cleanup | Manual cleanup | Auto-cleared by Vitest between tests |
| Global pipes | Not applied in E2E | Must call `app.useGlobalPipes()` |

**Critical Errors to Avoid:**

1. **Forgetting `await` on `compile()`**
```typescript
// ❌ Wrong
const module = Test.createTestingModule({ ... }).compile();

// ✅ Correct
const module = await Test.createTestingModule({ ... }).compile();
```

2. **Using Jest syntax with Vitest**
```typescript
// ❌ Wrong
import { jest } from '@jest/globals';
const mock = jest.fn();

// ✅ Correct
import { vi } from 'vitest';
const mock = vi.fn();
```

3. **Missing Fastify ready()**
```typescript
// ❌ Wrong
await app.init();
// Start testing immediately

// ✅ Correct
await app.init();
await app.getHttpAdapter().getInstance().ready();
// Now test
```

4. **Not overriding global guards**
```typescript
// ❌ Wrong (can't override)
providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }]

// ✅ Correct (can override)
providers: [
  { provide: APP_GUARD, useExisting: JwtAuthGuard },
  JwtAuthGuard,
]
```

---

### Testing Checklist for New Features

**Domain Layer:**
- [ ] Unit test for use case function (pure logic)
- [ ] Test all input variations
- [ ] Test error cases
- [ ] Verify repository called correctly

**Infrastructure Layer:**
- [ ] Repository test with mocked Drizzle
- [ ] Test all CRUD operations
- [ ] Test query filters (where, limit, order)
- [ ] Test data transformation (DB → Entity)

**Application Layer:**
- [ ] Service unit test with mocked repository
- [ ] Test success cases
- [ ] Test error handling
- [ ] Verify use case called with correct params

**Controller Layer:**
- [ ] Controller unit test with mocked service
- [ ] Test DTO validation
- [ ] Test response mapping
- [ ] Test error responses

**E2E Tests:**
- [ ] Happy path (POST/PUT/GET with valid data)
- [ ] Validation errors (400 for invalid input)
- [ ] Not found errors (404 for missing resources)
- [ ] Authorization (403 for unauthorized)
- [ ] Query parameter validation

**Coverage Target:** 80%+ overall, 100% for critical business logic

---

### Test Commands Summary

```bash
# Run all tests
npm test

# Watch mode (reruns on file changes)
npm run test:watch

# Coverage report
npm run test:cov

# UI mode (visual test runner)
npm run test:ui

# Run specific test file
npm test game.service.spec.ts

# Run tests matching pattern
npm test -- --grep "GameService"
```

**Test Environment:**
- Database: Test DB (configured in `vitest.config.ts`)
- Environment: `NODE_ENV=test`
- Config: `.env.test` (if exists)

---

### Best Practices

**DO:**
- ✅ Test business logic thoroughly
- ✅ Mock external dependencies (DB, AWS, APIs)
- ✅ Use descriptive test names
- ✅ Test both success and error cases
- ✅ Use `beforeEach` for test setup
- ✅ Clean up in `afterAll` (close app, connections)
- ✅ Use type-safe mocks
- ✅ Verify method calls with `.toHaveBeenCalledWith()`
- ✅ Test edge cases and boundary conditions
- ✅ Keep tests fast (mock slow operations)

**DON'T:**
- ❌ Use real database in unit tests
- ❌ Make real AWS calls
- ❌ Test framework code (test YOUR code)
- ❌ Write tests that depend on execution order
- ❌ Use `any` types in test code
- ❌ Leave `console.log` in tests
- ❌ Skip error case tests
- ❌ Test implementation details (test behavior)
- ❌ Mix Jest and Vitest syntax
- ❌ Forget to await async operations
