---
agent: agent
description: 'Fix failing tests following project patterns'
---

# Fix Failing Test

Analyze and fix the failing test following these steps:

## Step 1: Identify Test Type

Determine what kind of test is failing:
- [ ] Domain use case test (pure function)
- [ ] Service unit test (with mocked repository)
- [ ] Controller unit test (with mocked service)
- [ ] Repository test (with mocked Drizzle)
- [ ] E2E test (full app integration)

## Step 2: Common Issues Checklist

### Vitest vs Jest
- [ ] Using `vi.fn()` not `jest.fn()`
- [ ] Importing from `vitest` not `@jest/globals`
- [ ] Using `vi.spyOn()` not `jest.spyOn()`

### Async/Await
- [ ] `compile()` is awaited
- [ ] All async operations are awaited
- [ ] Promises are returned or awaited

### Fastify Specific (E2E)
- [ ] Using `FastifyAdapter` not default Express
- [ ] Calling `await app.getHttpAdapter().getInstance().ready()` after `app.init()`
- [ ] Using `app.inject()` not `supertest`

### Mocking
- [ ] All used methods are mocked
- [ ] Mock return values match expected types
- [ ] Spies are set up before method calls
- [ ] Drizzle chain methods return `this` (except terminal methods)

### Type Safety
- [ ] Using `module.get<Type>(Token)` for type safety
- [ ] Mock objects match interface types
- [ ] No `any` types in test code

### Global Overrides
- [ ] Guards/interceptors changed to `useExisting` in module
- [ ] Global providers are overridden in tests
- [ ] Database/AWS services are mocked

## Step 3: Domain Test Pattern

If it's a domain use case test:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { actionEntity } from './action-entity';
import type { IEntityRepository } from '../repositories/entity.repository.interface';

describe('actionEntity use case', () => {
  it('should perform action', async () => {
    // Create mock that matches interface
    const mockRepository: IEntityRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      // ... all interface methods
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

## Step 4: Service Test Pattern

If it's a service test:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntityService } from './entity.service';
import { EntityRepository } from '@infrastructure/repositories/entity.repository';

describe('EntityService', () => {
  let service: EntityService;
  let repository: EntityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: EntityRepository,
          useValue: {
            save: vi.fn(),
            findById: vi.fn(),
            // ... all methods used by service
          },
        },
      ],
    }).compile();

    service = module.get<EntityService>(EntityService);
    repository = module.get<EntityRepository>(EntityRepository);
  });

  it('should create entity', async () => {
    vi.spyOn(repository, 'save').mockResolvedValue(undefined);

    const result = await service.create({
      organizationId: 'org-1',
      name: 'Test',
    });

    expect(result).toHaveProperty('id');
    expect(repository.save).toHaveBeenCalled();
  });
});
```

## Step 5: E2E Test Pattern

If it's an E2E test:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@modules/app.module';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('EntityController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override ALL external dependencies
      .overrideProvider(EntityRepository)
      .useValue({
        save: vi.fn().mockResolvedValue(undefined),
        findById: vi.fn().mockResolvedValue(mockEntity),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );

    // Apply global pipes/filters
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.setGlobalPrefix('api/v1');

    await app.init();
    await app.getHttpAdapter().getInstance().ready(); // CRITICAL!
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/entities',
      payload: { organizationId: 'org-1', name: 'Test' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('id');
  });
});
```

## Step 6: Drizzle Mock Pattern

If testing repository with Drizzle:

```typescript
beforeEach(async () => {
  const mockDb = {
    // Chain methods return this
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    
    // Terminal methods return values
    onConflictDoUpdate: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([mockRow]),
  };

  const module = await Test.createTestingModule({
    providers: [
      EntityRepository,
      { provide: DRIZZLE_CONNECTION, useValue: mockDb },
    ],
  }).compile();

  repository = module.get<EntityRepository>(EntityRepository);
});
```

## Step 7: Run and Verify

After fixing:
1. Run single test: `npm test {filename}`
2. Run all tests: `npm test`
3. Check coverage: `npm run test:cov`
4. Verify no regressions

## Error Messages to Look For

### "jest is not defined"
- Fix: Import from `vitest` not `@jest/globals`
- Change `jest.fn()` to `vi.fn()`

### "Cannot read property 'getInstance' of undefined"
- Fix: Missing `await app.getHttpAdapter().getInstance().ready()`

### "compile is not a function"
- Fix: Missing `await` before `compile()`

### "Cannot find module"
- Fix: Check path aliases in imports
- Verify `@domain/*`, `@infrastructure/*`, `@modules/*`

### "Method not found"
- Fix: Add missing method to mock object
- Ensure mock matches interface

### "Expected 1 arguments, but got 0"
- Fix: Check function signature
- Provide all required parameters

## Ask User For

If you need more information:
1. Full error message and stack trace
2. Test file content
3. File being tested
4. Related dependencies (repositories, services)
5. Expected vs actual behavior
