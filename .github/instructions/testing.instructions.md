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

## Override Global Guards
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

// ✅ Correct
import { vi } from 'vitest';
const mock = vi.fn();
const module = await Test.createTestingModule({}).compile();
await app.init();
await app.getHttpAdapter().getInstance().ready();
```
