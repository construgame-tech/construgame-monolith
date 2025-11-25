---
applyTo: "**/*.spec.ts,**/*.e2e-spec.ts,test/**/*.ts"
---

# Testing Guidelines (Vitest + NestJS)

## CRITICAL Rules
- **Use Vitest syntax** - `vi.fn()` not `jest.fn()`
- **Import from 'vitest'** - never from `@jest/globals`
- **Fastify requires `ready()`** - call after `app.init()` in E2E tests
- **Always await `compile()`** - it's async

## Unit Test Pattern (Services/Controllers)
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
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    repository = module.get<GameRepository>(GameRepository);
  });

  it('should create game', async () => {
    vi.spyOn(repository, 'save').mockResolvedValue(undefined);

    const result = await service.create({
      organizationId: 'org-123',
      projectId: 'proj-123',
      name: 'Test Game',
    });

    expect(result).toHaveProperty('id');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
```

## E2E Test Pattern (Fastify)
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@modules/app.module';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('GameController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GameRepository)
      .useValue({
        save: vi.fn(),
        findById: vi.fn().mockResolvedValue(mockGame),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api/v1');

    await app.init();
    await app.getHttpAdapter().getInstance().ready(); // CRITICAL!
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/games should create game', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/games',
      payload: { organizationId: 'org-123', projectId: 'proj-123', name: 'Game' },
    });

    expect(response.statusCode).toBe(201);
  });
});
```

## Domain Use Case Test Pattern
```typescript
import { createGame } from './create-game';
import type { IGameRepository } from '../repositories/game.repository.interface';
import { describe, it, expect, vi } from 'vitest';

describe('createGame use case', () => {
  it('should create game with default status', async () => {
    const mockRepository: IGameRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };

    const result = await createGame(
      { organizationId: 'org-1', projectId: 'proj-1', name: 'Game' },
      mockRepository
    );

    expect(result.game.status).toBe('ACTIVE');
  });
});
```

## Mock Drizzle DB
```typescript
beforeEach(async () => {
  const mockDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockResolvedValue([]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  };

  const module = await Test.createTestingModule({
    providers: [
      GameRepository,
      { provide: DRIZZLE_CONNECTION, useValue: mockDb },
    ],
  }).compile();
});
```

## Auto-Mocking with useMocker()
**When to use**: Controller has many dependencies, avoid manually creating all mocks.

```typescript
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
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

## Override Global Enhancers (Guards/Interceptors/Pipes/Filters)

### Guards
```typescript
// 1. In module, change useClass to useExisting
providers: [
  { provide: APP_GUARD, useExisting: JwtAuthGuard },
  JwtAuthGuard,
],

// 2. In test, override the guard
const module = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(JwtAuthGuard)
  .useValue({ canActivate: () => true })
  .compile();
```

### All Override Methods
```typescript
// Override providers (services, repositories)
.overrideProvider(GameService).useValue(mockService)
.overrideProvider(GameService).useClass(MockGameService)
.overrideProvider(GameService).useFactory({ factory: () => mockService })

// Override guards
.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })

// Override interceptors
.overrideInterceptor(LoggingInterceptor).useValue({ intercept: (ctx, next) => next.handle() })

// Override pipes
.overridePipe(ValidationPipe).useValue({ transform: (val) => val })

// Override filters
.overrideFilter(HttpExceptionFilter).useValue({ catch: () => {} })

// Override modules
.overrideModule(DatabaseModule).useModule(MockDatabaseModule)
```

## Testing Request-Scoped Providers
**Challenge**: Request-scoped providers are created per request.

```typescript
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
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

## Module Reference Methods

```typescript
const moduleRef = await Test.createTestingModule({ ... }).compile();

// get() - Retrieve static instance (singleton/transient)
const service = moduleRef.get<GameService>(GameService);
const controller = moduleRef.get<GameController>(GameController);

// resolve() - Retrieve scoped instance (request/transient)
const scopedService = await moduleRef.resolve(GameService, contextId);

// select() - Navigate module dependency graph
const gameService = moduleRef.select(GameModule).get(GameService);
```

**CRITICAL**: 
- `get()` retrieves **static instances** (singleton scope)
- `resolve()` retrieves **scoped instances** (request/transient scope)
- `resolve()` returns different instance each time (unique DI sub-tree)

## Testing Module Compilation Methods

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
}).compile();

// createNestApplication() - Full HTTP app for E2E
const app = moduleRef.createNestApplication<NestFastifyApplication>(
  new FastifyAdapter()
);
await app.init();
await app.getHttpAdapter().getInstance().ready();

// createNestMicroservice() - Microservice for E2E
const microservice = moduleRef.createNestMicroservice({
  transport: Transport.TCP,
});
await microservice.listen();
```

**Note**: When using `compile()`, `HttpAdapterHost#httpAdapter` is undefined. Use `createNestApplication()` if you need the HTTP adapter during initialization.

## Test Checklist
- [ ] Unit test for domain use case
- [ ] Unit test for service (mocked repository)
- [ ] Unit test for controller (mocked service)
- [ ] E2E test for happy path (201/200)
- [ ] E2E test for validation (400)
- [ ] E2E test for not found (404)

## Common Mistakes
```typescript
// ❌ Wrong
import { jest } from '@jest/globals';
const mock = jest.fn();
const module = Test.createTestingModule({}).compile(); // Missing await
await app.init(); // Missing ready() for Fastify
moduleRef.get(GameService); // Missing type parameter

// ✅ Correct
import { vi } from 'vitest';
const mock = vi.fn();
const module = await Test.createTestingModule({}).compile();
await app.init();
await app.getHttpAdapter().getInstance().ready();
moduleRef.get<GameService>(GameService); // Type-safe
```

## Testing Best Practices

**DO**:
- ✅ Keep test files next to source (`.spec.ts` suffix)
- ✅ Keep E2E tests in `test/` directory (`.e2e-spec.ts` suffix)
- ✅ Use `beforeEach` for test setup
- ✅ Use `afterAll` to close app/connections
- ✅ Mock external dependencies (DB, AWS, APIs)
- ✅ Use type-safe `moduleRef.get<Type>(Token)`
- ✅ Verify method calls with `.toHaveBeenCalledWith()`
- ✅ Test both success and error cases

**DON'T**:
- ❌ Use real database in unit tests
- ❌ Make real AWS/API calls
- ❌ Test framework code (test YOUR code)
- ❌ Write tests that depend on execution order
- ❌ Use `any` types in test code
- ❌ Mix Jest and Vitest syntax
- ❌ Forget to await async operations
